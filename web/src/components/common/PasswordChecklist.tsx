import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { PASSWORD_RULES } from '../../utils/validators';
import './css/PasswordInput.css';

/** Danh sách tiêu chí mật khẩu (khớp rule backend), chỉ hiện khi đã bắt đầu gõ */
export const PasswordChecklist: React.FC<{ password: string }> = ({ password }) => (
  <AnimatePresence initial={false}>
    {password.length > 0 && (
      <motion.ul
        className="ui-password-checklist"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
      >
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <li key={rule.label} className={cn('ui-password-checklist__item', passed && 'is-passed')}>
              <span className="ui-password-checklist__dot">
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
