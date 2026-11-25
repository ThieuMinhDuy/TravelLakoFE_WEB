import { apiClient } from './apiClient';
import {
  AISuggestRequestDTO,
  AISuggestionResponse,
  AIOptimizeRequestDTO,
  AIOptimizeResponse,
  ChatMessage,
  ChatRequestDTO,
  ChatResponseDTO,
  ChatHistoryResponse,
} from '../types/ai';

// ─── Cấu hình URL gọi Backend từ biến môi trường VITE_API_URL ──────────────
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const isAbsoluteUrl = /^https?:\/\//i.test(rawApiUrl);
const API_BASE = isAbsoluteUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '';
const AI_API = isAbsoluteUrl ? `${API_BASE}/ai` : '/ai';

interface RawChatItem {
  _id?: string;
  role: 'user' | 'model' | 'assistant';
  content?: string;
  parts?: Array<{ text?: string }>;
  timestamp?: string;
}

type RawChatHistoryPayload =
  | RawChatItem[]
  | { messages?: RawChatItem[]; history?: RawChatItem[] };

function normalizeChatHistory(payload: RawChatHistoryPayload): ChatHistoryResponse {
  const rawList = Array.isArray(payload)
    ? payload
    : (payload?.messages ?? payload?.history ?? []);

  const messages: ChatMessage[] = rawList.map((item) => ({
    _id: item._id,
    role: item.role === 'assistant' ? 'model' : item.role,
    content:
      item.content ??
      item.parts?.map((p) => p.text ?? '').filter(Boolean).join('\n') ??
      '',
    timestamp: item.timestamp,
  }));

  return { messages };
}

// ─── POST /api/ai/suggest ─────────────────────────────────────────────────────
/**
 * Gọi AI gợi ý lịch trình hoàn chỉnh từ đầu.
 * Trả về schedule mẫu (chưa lưu DB) để user preview trước.
 */
export async function generateAISuggestion(
  data: AISuggestRequestDTO
): Promise<AISuggestionResponse> {
  const res = await apiClient.post<AISuggestionResponse>(`${AI_API}/suggest`, data);
  return res.data;
}

// ─── POST /api/ai/optimize/:tripId ────────────────────────────────────────────
/**
 * Tối ưu thứ tự di chuyển của lịch trình đã có (Gemini tính toán tọa độ).
 * - preview=true  → chỉ trả về kết quả, không lưu DB
 * - preview=false → lưu thẳng vào DB
 */
export async function optimizeTrip(
  tripId: string,
  data: AIOptimizeRequestDTO = {}
): Promise<AIOptimizeResponse> {
  const res = await apiClient.post<AIOptimizeResponse>(
    `${AI_API}/optimize/${tripId}`,
    data
  );
  return res.data;
}

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
/** Chat tự do với AI trợ lý du lịch */
export async function sendChatMessage(
  data: ChatRequestDTO
): Promise<ChatResponseDTO> {
  const res = await apiClient.post<ChatResponseDTO>(`${AI_API}/chat`, data);
  return res.data;
}

// ─── GET /api/ai/chat ─────────────────────────────────────────────────────────
/** Lấy lịch sử chat của user hiện tại */
export async function getChatHistory(): Promise<ChatHistoryResponse> {
  const res = await apiClient.get<RawChatHistoryPayload>(`${AI_API}/chat`);
  return normalizeChatHistory(res.data);
}

// ─── DELETE /api/ai/chat ──────────────────────────────────────────────────────
/** Xóa toàn bộ lịch sử chat */
export async function clearChatHistory(): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`${AI_API}/chat`);
  return res.data;
}
