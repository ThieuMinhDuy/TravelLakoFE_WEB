import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import authBannerImg from '../assets/authbanner.webp';
import logoImg from '../assets/logo.webp';
import './css/AuthLayout.css';

export const AuthLayout: React.FC = () => {
  return (
    <div className="auth-layout">
      {/* Left Column: Visual Banner with Slogan (Figma Split-Screen) */}
      <div className="auth-layout__banner">
        {/* Background Image */}
        <img
          src={authBannerImg}
          alt="Du lịch Việt Nam"
          className="auth-layout__banner-img"
        />

        {/* Gradient Overlay for Contrast */}
        <div className="auth-layout__banner-overlay" />

        {/* Top Logo */}
        <div className="auth-layout__banner-header">
          <img src={logoImg} alt="Logo" className="auth-layout__banner-logo" />
          <span className="auth-layout__banner-brand">
            Travel<span className="auth-layout__banner-highlight">Lako</span>
          </span>
        </div>

        {/* Bottom Headline & Slogan in Font Script (Caveat) */}
        <div className="auth-layout__banner-footer">
          <p className="auth-layout__banner-quote">
            Tận hưởng chuyến đi tuyệt vời nhất!
          </p>
          <p className="auth-layout__banner-sub">
            Khám phá 63 tỉnh thành Việt Nam, lập lịch trình thông minh và đồng hành cùng trợ lý AI.
          </p>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="auth-layout__content">
        {/* Mobile Header Logo */}
        <div className="auth-layout__mobile-header">
          <Link to="/" className="auth-layout__mobile-link">
            <img src={logoImg} alt="Logo" className="auth-layout__mobile-logo" />
            <span className="auth-layout__mobile-brand">
              Travel<span className="text-oceanBlue">Lako</span>
            </span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="auth-layout__form-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
