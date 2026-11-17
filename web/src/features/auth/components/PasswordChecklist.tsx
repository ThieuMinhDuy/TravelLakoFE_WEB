import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../../utils/cn';

const RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: 'Tối thiểu 6 ký tự', test: (v) => v.length >= 6 },
  { label: '1 chữ in hoa', test: (v) => /[A-Z]/.test(v) },
  { label: '1 chữ thường', test: (v) => /[a-z]/.test(v) },
  { label: '1 chữ số', test: (v) => /[0-9]/.test(v) },
];

/** Danh sách tiêu chí mật khẩu (khớp rule backend), chỉ hiện khi đã bắt đầu gõ */
export const PasswordChecklist: React.FC<{ password: string }> = ({ password }) => (
  <AnimatePresence initial={false}>
    {password.length > 0 && (
      <motion.ul
        className="auth-checklist"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
      >
        {RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <li key={rule.label} className={cn('auth-checklist__item', passed && 'is-passed')}>
              <span className="auth-checklist__dot">
                {passed && <Check className="w-2.5 h-2.5" strokeWidth={3.5} />}
              </span>
              {rule.label}
            </li>
          );
        })}
      </motion.ul>
    )}
  </AnimatePresence>
);
