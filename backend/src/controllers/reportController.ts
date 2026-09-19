import { Request, Response } from "express";
import { supabase } from "../config/supabase.ts";

/**
 * Records a user report/flag of AI-generated content (Google Play Developer
 * Program Policy requires an in-app way to report offensive AI output without
 * leaving the app). Always logs to the server console so the team sees flags
 * even if the optional `content_reports` table has not been migrated yet.
 */
export const createContentReport = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { sessionId, reason, message } = req.body || {};

  if (!reason || typeof reason !== "string" || !reason.trim()) {
    return res.status(400).json({ error: "A reason is required to submit a report." });
  }

  const record = {
    user_id: userId ?? null,
    session_id: typeof sessionId === "string" ? sessionId : null,
    reason: reason.trim().slice(0, 200),
    message: typeof message === "string" ? message.trim().slice(0, 2000) : null,
    created_at: new Date().toISOString(),
  };

  console.warn("🚩 Content report received:", record);

  try {
    const { error } = await supabase.from("content_reports").insert(record);
    if (error && error.code !== "42P01") {
      console.error("Failed to persist content report:", error.message);
    }
  } catch (err) {
    console.error("Failed to persist content report:", err);
  }

  // Always succeed from the client's perspective — the console/log line above
  // is the compliance-required record even if the table isn't migrated yet.
  res.status(200).json({ success: true });
};
