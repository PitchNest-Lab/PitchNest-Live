export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Deck {
  id: number;
  name: string;
  file_url: string;
  size?: number;
  status?: string;
  created_at?: string;
  extracted_text?: string;
}

export interface PitchConfig {
  mode: 'panel' | 'coach' | 'solo';
  businessName: string;
  description: string;
  industry: string;
  investorArchetype: string;
  aggressiveness: number;
  riskAppetite: number;
  cameraEnabled: boolean;
  micEnabled: boolean;
  selectedDeck?: Deck | null;
}

export interface TranscriptEntry {
  id: string;
  text: string;
  type: 'user' | 'ai';
  speaker?: string;
  inputMethod?: 'voice' | 'chat';
}

export interface SessionScores {
  delivery?: number;
  clarity?: number;
  scalability?: number;
  readiness?: number;
}

export interface EvaluationReport {
  summary?: string;
  scores?: SessionScores;
  strengths?: string[];
  risks?: string[];
  next_steps?: string[];
  transcript?: TranscriptEntry[];
  duration?: number;
}

export interface Session {
  id: number;
  business_name?: string;
  summary?: string;
  evaluation_report?: EvaluationReport;
  created_at?: string;
  share_id?: string;
  video_url?: string;
}

export interface LiveScores {
  clarity: number | null;
  confidence: number | null;
  marketFit: number | null;
  readiness: number | null;
}
