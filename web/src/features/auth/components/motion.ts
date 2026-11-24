import type { Transition, Variants } from 'framer-motion';

export const EASE_OUT: Transition['ease'] = [0.22, 1, 0.36, 1];

/**
 * Trượt ngang giữa các màn trong popup.
 * `custom` = hướng: 1 (đi tới), -1 (quay lại), 0 (lần mở đầu tiên).
 * Các nhãn enter/center/exit được truyền xuống con (AuthItem) để tạo hiệu ứng xuất hiện lần lượt.
 */
export const slideVariants: Variants = {
  enter: (direction: number) => ({ x: direction * 56, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { duration: 0.38, ease: EASE_OUT },
      opacity: { duration: 0.25 },
      staggerChildren: 0.045,
      delayChildren: 0.04,
    },
  },
  exit: (direction: number) => ({
    x: direction * -56,
    opacity: 0,
    transition: { duration: 0.16, ease: 'easeIn' },
  }),
};

/** Từng dòng trong form xuất hiện lần lượt */
export const itemVariants: Variants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE_OUT } },
  exit: { opacity: 1 },
};

/** Rung card khi có lỗi */
export const SHAKE_KEYFRAMES = { x: [0, -10, 10, -7, 7, -3, 3, 0] };
