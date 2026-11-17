import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import authBannerImg from '../assets/authbanner.webp';
import logoImg from '../assets/logo.webp';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex bg-surfaceWhite">
      {/* Left Column: Visual Banner with Slogan (Figma Split-Screen) */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden select-none">
        {/* Background Image */}
        <img
          src={authBannerImg}
          alt="Du lịch Việt Nam"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-slate-950/30" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <img src={logoImg} alt="Logo" className="w-10 h-10 object-contain brightness-200" />
          <span className="font-extrabold text-2xl text-white tracking-tight">
            Travel<span className="text-sky-400">Lako</span>
          </span>
        </div>

        {/* Bottom Headline & Slogan in Font Script (Caveat) */}
        <div className="relative z-10 max-w-lg space-y-3">
          <p className="font-script text-white text-5xl sm:text-6xl drop-shadow-md leading-tight">
            Tận hưởng chuyến đi tuyệt vời nhất!
          </p>
          <p className="text-sm text-slate-200 font-medium leading-relaxed drop-shadow-sm">
            Khám phá 63 tỉnh thành Việt Nam, lập lịch trình thông minh và đồng hành cùng trợ lý AI.
          </p>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-12 bg-surfaceWhite">
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="w-9 h-9 object-contain" />
            <span className="font-extrabold text-xl text-slate-900">
              Travel<span className="text-oceanBlue">Lako</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
