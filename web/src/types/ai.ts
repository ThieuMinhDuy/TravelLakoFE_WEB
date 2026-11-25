// ─── AI Types ────────────────────────────────────────────────────────────────

import { DaySchedule } from './trip';

// ─── Chat ─────────────────────────────────────────────────────────────────────
export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  _id?: string;
  role: ChatRole;
  content: string;       // text từ AI hoặc user
  timestamp?: string;    // ISO string
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
}

export interface ChatRequestDTO {
  message: string;
}

export interface ChatResponseDTO {
  reply: string;
  timestamp?: string;
}

// ─── AI Suggestion (POST /api/ai/suggest) ────────────────────────────────────
export interface AISuggestRequestDTO {
  cityId: string;
  days: number;
  budget?: number;
  preferences?: string[];   // e.g. ['ẩm thực', 'văn hóa']
  notes?: string;
}

export interface AISuggestionResponse {
  success: boolean;
  city: {
    _id: string;
    name: string;
    image?: string;
  };
  suggestedTitle: string;
  estimatedTotalCost: number;
  schedule: DaySchedule[];
}

// ─── AI Optimize (POST /api/ai/optimize/:tripId) ─────────────────────────────
export interface AIOptimizeRequestDTO {
  notes?: string;
  preview?: boolean;              // true = chỉ preview, false = lưu DB
  optimizedSchedule?: DaySchedule[]; // gửi kèm nếu dùng cached preview
}

export interface AIOptimizeResponse {
  _id: string;
  title: string;
  city: unknown;
  schedule: DaySchedule[];
  preview?: boolean;
}

