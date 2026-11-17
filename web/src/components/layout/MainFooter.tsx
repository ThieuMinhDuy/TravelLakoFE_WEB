import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.webp';
import { MapPin, Phone, Mail } from 'lucide-react';

export const MainFooter: React.FC = () => {
  return (
    <footer className="border-t border-borderGray bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoImg} alt="TravelLako" className="h-9 w-auto brightness-200" />
              <span className="font-extrabold text-xl text-white">
                Travel<span className="text-sky-400">Lako</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nền tảng tư vấn, lập lịch trình và tự động tối ưu hóa chuyến đi du lịch thông minh
              hàng đầu Việt Nam.
            </p>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Dịch vụ</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/places" className="hover:text-white transition-colors">
                  Khám phá 63 tỉnh thành
                </Link>
              </li>
              <li>
                <Link to="/trips" className="hover:text-white transition-colors">
                  Lập kế hoạch lịch trình thông minh
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Cẩm nang & Kinh nghiệm du lịch
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Gợi ý lịch trình bằng AI Gemini
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Liên kết hữu ích</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Tài khoản cá nhân
                </Link>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Cổng quản trị viên
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Thông tin liên hệ</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>+84 987 654 321</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>contact@travellako.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} TravelLako. All rights reserved.</p>
          <p>Thiết kế tinh tế theo chuẩn Modern Natural Travel.</p>
        </div>
      </div>
    </footer>
  );
};
