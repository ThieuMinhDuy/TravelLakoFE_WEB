import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import { MapPin, Phone, Mail } from 'lucide-react';
import './css/MainFooter.css';

export const MainFooter: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="main-footer__container">
        <div className="main-footer__grid">
          {/* Col 1: Brand & Bio */}
          <div className="main-footer__brand">
            <Link to="/" className="main-footer__logo-link">
              <img src={logoImg} alt="TripMate" className="main-footer__logo" />
              <span className="main-footer__brand-title">
                Trip<span className="main-footer__brand-highlight">Mate</span>
              </span>
            </Link>
            <p className="main-footer__brand-desc">
              Nền tảng tư vấn, lập lịch trình và tự động tối ưu hóa chuyến đi du lịch thông minh
              hàng đầu Việt Nam.
            </p>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="main-footer__heading">Dịch vụ</h4>
            <ul className="main-footer__list">
              <li>
                <Link to="/places" className="main-footer__link">
                  Khám phá 63 tỉnh thành
                </Link>
              </li>
              <li>
                <Link to="/trips" className="main-footer__link">
                  Lập kế hoạch lịch trình thông minh
                </Link>
              </li>
              <li>
                <Link to="/blog" className="main-footer__link">
                  Cẩm nang & Kinh nghiệm du lịch
                </Link>
              </li>
              <li>
                <Link to="/" className="main-footer__link">
                  Gợi ý lịch trình bằng AI Gemini
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="main-footer__heading">Liên kết hữu ích</h4>
            <ul className="main-footer__list">
              <li>
                <Link to="/profile" className="main-footer__link">
                  Tài khoản cá nhân
                </Link>
              </li>
              <li>
                <a href="#terms" className="main-footer__link">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#privacy" className="main-footer__link">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <Link to="/admin" className="main-footer__link">
                  Cổng quản trị viên
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="main-footer__heading">Thông tin liên hệ</h4>
            <ul className="main-footer__contact-list">
              <li className="main-footer__contact-item">
                <MapPin className="main-footer__contact-icon" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="main-footer__contact-item">
                <Phone className="main-footer__contact-icon" />
                <span>+84 987 654 321</span>
              </li>
              <li className="main-footer__contact-item">
                <Mail className="main-footer__contact-icon" />
                <span>contact@tripmate.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="main-footer__bottom">
          <p>© {new Date().getFullYear()} TripMate. All rights reserved.</p>
          <p>Thiết kế tinh tế theo chuẩn Modern Natural Travel.</p>
        </div>
      </div>
    </footer>
  );
};
