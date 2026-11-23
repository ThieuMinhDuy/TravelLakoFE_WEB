import { z } from 'zod';
import { getPasswordError, isValidGmail } from '../../utils/validators';

const emailField = z
  .string()
  .trim()
  .min(1, 'Vui lòng nhập email')
  .email('Email không hợp lệ');

/** Backend chỉ cho đăng ký bằng địa chỉ @gmail.com */
const gmailField = emailField.refine(isValidGmail, 'Chỉ chấp nhận địa chỉ @gmail.com');

/** Mật khẩu mạnh: ≥ 6 ký tự, có chữ hoa, chữ thường và chữ số (khớp rule backend) */
const strongPasswordField = z.string().superRefine((value, ctx) => {
  const message = getPasswordError(value);
  if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
});

export const loginSchema = z.object({
  email: emailField,
  // Chặn mật khẩu toàn dấu cách: backend trả 400 cho trường hợp này, mà 400 ở API đăng nhập
  // được FE hiểu là "tài khoản chưa xác thực" → phải chặn ngay từ form
  password: z.string().refine((v) => v.trim() !== '', 'Vui lòng nhập mật khẩu'),
  remember: z.boolean(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên tối đa 50 ký tự'),
  email: gmailField,
  password: strongPasswordField,
  agree: z.boolean().refine((v) => v, 'Bạn cần đồng ý với Điều khoản và Chính sách'),
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const newPasswordSchema = z
  .object({
    newPassword: strongPasswordField,
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  });
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
