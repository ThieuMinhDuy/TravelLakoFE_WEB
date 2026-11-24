/**
 * Lỗi tải chunk JS của route lazy — thường xảy ra khi vừa deploy bản mới
 * (file chunk cũ bị xóa) hoặc mạng chập chờn.
 */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk [\w-]+ failed|ChunkLoadError/i.test(
    message
  );
}

const CHUNK_RELOAD_KEY = 'tripmate_chunk_reload_at';
/** Không tự reload lại nếu vừa reload trong khoảng này (tránh vòng lặp reload vô hạn) */
const CHUNK_RELOAD_COOLDOWN = 10_000;

/**
 * Tải lại trang một lần để lấy bản build mới khi gặp lỗi tải chunk.
 * @param reload Hàm tải lại trang (thay được khi test)
 * @returns true nếu đã kích hoạt reload
 */
export function reloadOnceForChunkError(
  reload: () => void = () => window.location.reload(),
  now = Date.now()
): boolean {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);
    if (now - last < CHUNK_RELOAD_COOLDOWN) return false;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
  } catch {
    // sessionStorage bị chặn → vẫn thử reload một lần
  }
  reload();
  return true;
}
