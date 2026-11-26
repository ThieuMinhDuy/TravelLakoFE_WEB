export interface InlineSegment {
  text: string;
  bold: boolean;
}

export type FormattedChatBlock =
  | { type: 'spacer' }
  | { type: 'heading'; segments: InlineSegment[] }
  | { type: 'bullet'; segments: InlineSegment[] }
  | { type: 'paragraph'; segments: InlineSegment[] };

/**
 * Loại bỏ các ký tự Markdown dư thừa và tách đoạn chữ thành các phần in đậm / thường,
 * giữ nguyên văn bản, số tiền (2.500.000đ) và dấu câu tự nhiên.
 */
export function parseInlineSegments(rawLine: string): InlineSegment[] {
  // Bỏ backtick inline hoặc escape dấu sao/gạch dưới nếu có
  const cleaned = rawLine
    .replace(/\\([*_`#])/g, '$1')
    .replace(/`([^`]+)`/g, '$1');

  const segments: InlineSegment[] = [];
  // Ghép các cặp **in đậm** hoặc __in đậm__
  const boldRegex = /\*\*([^*]+?)\*\*|__([^_]+?)__/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const pushPlain = (plainText: string) => {
    // Gỡ dấu ** lẻ, *bao chữ* (nhưng giữ phép nhân có khoảng trắng "a * b")
    const sanitized = plainText
      .replace(/\*\*/g, '')
      .replace(/(^|\s)\*([^\s*][^*]*?)\*(?=$|\s|[.,!?:;)])/g, '$1$2')
      .replace(/__/g, '');
    if (!sanitized) return;

    const prev = segments[segments.length - 1];
    if (prev && !prev.bold) {
      prev.text += sanitized;
    } else {
      segments.push({ text: sanitized, bold: false });
    }
  };

  while ((match = boldRegex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      pushPlain(cleaned.slice(lastIndex, match.index));
    }

    const boldText = (match[1] ?? match[2] ?? '').replace(/\*/g, '');
    if (boldText) {
      const prev = segments[segments.length - 1];
      if (prev && prev.bold) {
        prev.text += boldText;
      } else {
        segments.push({ text: boldText, bold: true });
      }
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < cleaned.length) {
    pushPlain(cleaned.slice(lastIndex));
  }

  return segments.length > 0 ? segments : [{ text: '', bold: false }];
}

/**
 * Phân tích nội dung tin nhắn AI thành danh sách block sạch (tiêu đề, gạch đầu dòng, đoạn văn),
 * loại bỏ hoàn toàn các ký tự đặc biệt như ###, **, * đầu dòng.
 */
export function parseFormattedChatBlocks(content: string): FormattedChatBlock[] {
  if (!content) return [];

  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: FormattedChatBlock[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (blocks.length > 0 && blocks[blocks.length - 1].type !== 'spacer') {
        blocks.push({ type: 'spacer' });
      }
      continue;
    }

    // Bỏ đường kẻ ngang Markdown (---, ***, ___)
    if (/^[-*_]{3,}$/.test(trimmed)) {
      if (blocks.length > 0 && blocks[blocks.length - 1].type !== 'spacer') {
        blocks.push({ type: 'spacer' });
      }
      continue;
    }

    // Tiêu đề dạng ### Ngày 1: ...
    const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        segments: parseInlineSegments(headingMatch[1]),
      });
      continue;
    }

    // Dòng liệt kê dạng * Sáng: ..., - Chiều: ...
    const bulletMatch = trimmed.match(/^[-*+•]\s+(.+)$/);
    if (bulletMatch) {
      blocks.push({
        type: 'bullet',
        segments: parseInlineSegments(bulletMatch[1]),
      });
      continue;
    }

    blocks.push({
      type: 'paragraph',
      segments: parseInlineSegments(trimmed),
    });
  }

  while (blocks[blocks.length - 1]?.type === 'spacer') {
    blocks.pop();
  }

  return blocks;
}

/** Chuyển nội dung Markdown sang văn bản thuần sạch ký tự đặc biệt */
export function formatPlainChatText(content: string): string {
  return parseFormattedChatBlocks(content)
    .map((block) => {
      if (block.type === 'spacer') return '';
      const text = block.segments.map((s) => s.text).join('');
      return block.type === 'bullet' ? `• ${text}` : text;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Nhận diện tin nhắn AI có chứa lịch trình cụ thể theo ngày (vd: "Ngày 1", "Sáng:/Chiều:/Tối:")
 * để hiển thị nút "Lưu lịch trình". Tránh hiện nhầm ở câu chào hoặc câu hỏi làm rõ thông tin.
 */
export function isScheduleMessage(content: string): boolean {
  if (!content || content.trim().length < 40) return false;

  const plain = formatPlainChatText(content);
  const dayMatches = plain.match(/(?:^|\n)\s*(?:•\s*)?Ngày\s+\d+\b/gi) ?? [];
  if (dayMatches.length === 0) return false;

  const hasTimeSlot = /(?:Sáng|Trưa|Chiều|Tối)\s*:/i.test(plain);
  const hasPriceTag = /\(\s*[\d.,]+\s*đ(?:\/đêm)?\s*\)/i.test(plain);

  return dayMatches.length >= 2 || hasTimeSlot || hasPriceTag;
}

