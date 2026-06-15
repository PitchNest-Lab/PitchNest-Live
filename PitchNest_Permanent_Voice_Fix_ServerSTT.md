# PitchNest Live Room — Permanent Voice-Input Fix (Server-Side STT)

## Goal
Replace the browser `webkitSpeechRecognition` path (fragile, browser-
dependent, currently broken) with **server-side streaming speech-to-text**
using `microsoft-cognitiveservices-speech-sdk` — the same package and
credentials (`AZURE_SPEECH_KEY` / `AZURE_SPEECH_REGION`) already used for TTS
in `backend/src/services/ttsService.ts` (or wherever `synthesizeSpeech` lives).
**No new Azure resource. No new npm package.**

The frontend's existing PCM-capture pipeline (16kHz, mono, Int16 — built for
the dead Gemini path) is reused as-is, just sent under a new message type the
backend actually handles.

---

## 1. New backend file: `backend/src/services/sttService.ts`

```ts
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { config } from "../config/env";

export function hasAzureSttConfig(): boolean {
  return !!(config.azureSpeechKey && config.azureSpeechRegion);
}

export interface StreamingRecognizer {
  pushAudio: (pcm16: Buffer) => void;
  stop: () => void;
}

/**
 * Starts a continuous Azure Speech recognizer fed by a push stream.
 * Call pushAudio() with raw 16kHz mono PCM16 buffers as they arrive.
 * onFinalText fires once per recognized utterance (final result only).
 */
export function createStreamingRecognizer(
  onFinalText: (text: string) => void,
): StreamingRecognizer | null {
  if (!hasAzureSttConfig()) {
    console.warn("[stt] Azure Speech not configured — server STT disabled");
    return null;
  }

  const speechConfig = sdk.SpeechConfig.fromSubscription(
    config.azureSpeechKey,
    config.azureSpeechRegion,
  );
  speechConfig.speechRecognitionLanguage = "en-US";
  // Slightly longer end-of-utterance silence tolerance for pitch speech
  speechConfig.setProperty(
    sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,
    "800",
  );

  const format = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
  const pushStream = sdk.AudioInputStream.createPushStream(format);
  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  recognizer.recognized = (_s, e) => {
    if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
      const text = e.result.text?.trim();
      if (text) {
        console.log("[stt] recognized:", text);
        onFinalText(text);
      }
    }
  };

  recognizer.canceled = (_s, e) => {
    console.error("[stt] canceled:", e.errorDetails);
  };

  recognizer.sessionStopped = () => {
    console.log("[stt] session stopped");
  };

  recognizer.startContinuousRecognitionAsync(
    () => console.log("[stt] continuous recognition started"),
    (err) => console.error("[stt] failed to start:", err),
  );

  return {
    pushAudio: (pcm16: Buffer) => {
      const arrayBuf = pcm16.buffer.slice(
        pcm16.byteOffset,
        pcm16.byteOffset + pcm16.byteLength,
      );
      pushStream.write(arrayBuf as ArrayBuffer);
    },
    stop: () => {
      try {
        recognizer.stopContinuousRecognitionAsync(
          () => {
            pushStream.close();
            recognizer.close();
          },
          () => {
            pushStream.close();
            recognizer.close();
          },
        );
      } catch (e) {
        console.error("[stt] error stopping:", e);
      }
    },
  };
}
```

---

## 2. `backend/src/sockets/restSocket.ts` — wire it in

### 2.1 Import
```ts
import { createStreamingRecognizer, hasAzureSttConfig, StreamingRecognizer } from "../services/sttService";
```

### 2.2 Per-connection variable (near the other `let` declarations, ~line 2474)
```ts
let sttRecognizer: StreamingRecognizer | null = null;
```

### 2.3 Start the recognizer once setup is complete
Inside the `data.type === "client_ready"` branch, **after** `hasSentSetup = true`
and after `masterPrompt`/`conversationHistory` are ready (so `onFinalText` can
safely call `enqueueTurn`):

```ts
if (hasAzureSttConfig()) {
  sttRecognizer = createStreamingRecognizer((text) => {
    if (sessionEnded) return;

    lastUserActivityTime = Date.now();
    hasNudged = false;

    // Clear pending nudges so they don't pile up behind real speech
    for (let i = turnQueue.length - 1; i >= 0; i--) {
      if (turnQueue[i].isNudge) turnQueue.splice(i, 1);
    }

    fullTranscript.push({ type: "user", text, inputMethod: "voice" });
    sendJson(ws, {
      type: "chat_message",
      speaker: "user",
      text,
      inputMethod: "voice",
    }); // so the frontend can render it in the transcript

    enqueueTurn({ text, inputMethod: "voice" });
  });
} else {
  console.warn("[stt] AZURE_SPEECH_KEY/REGION not set — voice input via server STT disabled");
}
```

> Note: confirm the exact `type` your frontend's `handleMessage` switch uses
> to render an incoming user transcript bubble — reuse that type so this
> shows up in the chat log the same way a typed message would. If the
> frontend currently only renders `chat_message` for `speaker !== "user"`
> (i.e. assumes user messages are added locally, not pushed from the
> server), add a small case so server-originated user transcripts also
> render. This is a 5-line frontend addition, not a structural change.

### 2.4 New message branch — receive audio chunks
Add alongside the other `if (data.type === ...)` branches (e.g. right after
the `heartbeat` branch):

```ts
if (data.type === "audio_chunk" && hasSentSetup) {
  if (sttRecognizer && !sessionEnded) {
    try {
      const buf = Buffer.from(data.data, "base64");
      sttRecognizer.pushAudio(buf);
    } catch (e) {
      console.error("[stt] failed to push audio chunk:", e);
    }
  }
  return;
}
```

### 2.5 Stop the recognizer on disconnect / session end
In the existing `ws.on("close", ...)` handler:
```ts
ws.on("close", () => {
  console.log("🔌 Client disconnected.");
  if (idleCheckInterval) clearInterval(idleCheckInterval);
  if (sttRecognizer) sttRecognizer.stop();
});
```

Also stop it inside the `data.type === "end_session"` branch (wherever
`sessionEnded = true` is set), so it doesn't keep transcribing during the
verdict phase:
```ts
if (sttRecognizer) {
  sttRecognizer.stop();
  sttRecognizer = null;
}
```

---

## 3. Frontend: `frontend/src/pages/LivePitchRoom.tsx`

### 3.1 Rename the PCM send (in the "Raw PCM audio streaming" effect)
Change:
```ts
socket.send(JSON.stringify({
  realtimeInput: {
    mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: base64 }]
  }
}));
```
to:
```ts
socket.send(JSON.stringify({ type: 'audio_chunk', data: base64 }));
```
Everything else in that effect (resampling, gating on `isPitching` /
`isMicMuted` / `verdictPhase` / `stream`) stays unchanged.

### 3.2 Fix the mic→speaker connection while editing this block
```ts
source.connect(processor);
const silentSink = ctx.createGain();
silentSink.gain.value = 0;
processor.connect(silentSink);
silentSink.connect(ctx.destination);
```

### 3.3 Remove (or disable) the browser SpeechRecognition block
The entire `// ── SpeechRecognition for live text transcript display ──`
`useEffect` (the one with `recognitionRef`, `transcriptBufferRef`,
`noSpeechCountRef`, `onresult`, sending `type: "voice_transcript"`/
`"chat_message"`) is now redundant — server STT covers transcription and
pushes the transcript back via `chat_message` (step 2.3).

**Safest approach**: don't delete yet — wrap the effect body in an early
return so it's inert, confirm server STT works end-to-end for a few
sessions, then delete the dead code entirely along with
`recognitionRef`, `transcriptBufferRef`, `transcriptTimerRef`,
`noSpeechCountRef`:

```ts
useEffect(() => {
  return; // Disabled — replaced by server-side STT (see sttService.ts)
  // ... existing body left in place, unreachable ...
}, [isPitching, socket, isConnected, isMicMuted, verdictPhase]);
```

### 3.4 `isSpeakingRef` / `lastAiSpeakingEndedTimeRef`
These were only used to gate the now-disabled `onresult` handler. They can
stay (harmless, unused) until the Phase-3 cleanup, or be removed alongside it.

---

## 4. Why this is "permanent"

- **No browser API dependency** — works on Chrome, Safari, Firefox, mobile,
  regardless of HTTPS/permission quirks beyond the initial `getUserMedia`
  grant you already require for the camera.
- **No silent failure mode** — every recognized utterance logs
  `[stt] recognized: ...` server-side. If the AI still doesn't respond, the
  logs immediately tell you whether the problem is (a) audio not arriving
  (no `[stt]` logs at all → check `audio_chunk` is being sent/received), or
  (b) audio arriving but not transcribing (check Azure Speech resource
  quota/region), or (c) transcribing fine but `enqueueTurn` not firing
  (separate bug in turn-queue logic).
- **Removes the feedback-loop risk** from `isSpeakingRef` getting stuck —
  there's no client-side gate on whether transcripts get sent anymore.

---

## 5. Test checklist

- [ ] Start a pitch session, speak a full sentence. Backend logs show
      `[stt] continuous recognition started` then `[stt] recognized: <your words>`.
- [ ] The transcript appears in the chat log (frontend renders the
      server-pushed `chat_message`).
- [ ] The AI responds to it (turn_complete fires, audio/text comes back).
- [ ] Mute the mic mid-session — confirm `audio_chunk` stops being sent
      (check Network tab / add a temporary `console.log` if needed) and STT
      stops logging new recognitions.
- [ ] Speak while the AI is talking (no headphones) — confirm no audible
      echo (step 3.2) and that the AI's own TTS doesn't get transcribed as
      user speech. If it does, that's an `echoCancellation` constraint issue
      in `useMediaRecorder`'s `getUserMedia` call — check it includes
      `audio: { echoCancellation: true, noiseSuppression: true }`.
- [ ] End session — confirm `[stt] session stopped` / no recognizer left
      running (check no repeated logs after the session ends).

---

## 6. If it *still* doesn't work after this

The `[stt]` logs will tell you exactly where it breaks:
- **No `[stt] recognized` logs ever** → `audio_chunk` messages aren't
  reaching the backend at all. Check: is the PCM effect's `if (!isPitching
  || !socket || !isConnected || isMicMuted || verdictPhase)` guard returning
  early? Add a `console.log` right before `socket.send` in the frontend to
  confirm chunks are actually being sent.
- **`[stt] canceled` with an error** → check `AZURE_SPEECH_KEY`/
  `AZURE_SPEECH_REGION` are valid and the region matches the resource (a
  region mismatch is the most common cause of immediate cancellation).
- **`[stt] recognized` logs appear but AI doesn't respond** → the bug has
  moved into `enqueueTurn`/`drainTurnQueue`/`processAiTurn` — a different,
  much narrower problem than "AI can't hear you" (this would mean it *can*
  hear you now).
