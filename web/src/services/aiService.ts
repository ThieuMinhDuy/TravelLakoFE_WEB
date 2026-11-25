import { apiClient } from './apiClient';
import {
  AISuggestRequestDTO,
  AISuggestionResponse,
  AIOptimizeRequestDTO,
  AIOptimizeResponse,
  ChatRequestDTO,
  ChatResponseDTO,
  ChatHistoryResponse,
} from '../types/ai';

// ─── Cấu hình URL gọi Backend từ biến môi trường VITE_API_URL ──────────────
const rawApiUrl = (
  import.meta.env.VITE_API_URL || 'https://travellako-backend.onrender.com/api'
).replace(/\/+$/, '');

// Chuẩn hóa: Đảm bảo có đuôi /api nếu người dùng cấu hình domain gốc
const API_BASE = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
const AI_API = `${API_BASE}/ai`;

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

// ─── GET /api/ai/chat/history ─────────────────────────────────────────────────
/** Lấy lịch sử chat của user hiện tại */
export async function getChatHistory(): Promise<ChatHistoryResponse> {
  const res = await apiClient.get<ChatHistoryResponse>(`${AI_API}/chat/history`);
  return res.data;
}

// ─── DELETE /api/ai/chat/history ─────────────────────────────────────────────
/** Xóa toàn bộ lịch sử chat */
export async function clearChatHistory(): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`${AI_API}/chat/history`);
  return res.data;
}
