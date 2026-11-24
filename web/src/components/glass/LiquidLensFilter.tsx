import React, { useEffect } from 'react';

interface NavigatorUAData {
  brands?: { brand: string }[];
}

/**
 * Chỉ Chromium (Chrome, Edge, Cốc Cốc...) vẽ được bộ lọc SVG trong `backdrop-filter`.
 * Safari/Firefox nhận cú pháp nhưng vẽ sai hoặc mất luôn hiệu ứng mờ → không bật ở đó.
 */
function supportsBackdropUrl(): boolean {
  if (typeof navigator === 'undefined') return false;
  const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData;
  return Boolean(uaData?.brands?.some((b) => b.brand === 'Chromium'));
}

/**
 * Bộ lọc khúc xạ "chất lỏng" dùng cho `.glass--lens`: nhiễu fractal mềm làm lệch nhẹ
 * hình nền phía sau tấm kính, giống mép kính cong trên iOS. Mount một lần trong AdminLayout.
 */
export const LiquidLensFilter: React.FC = () => {
  useEffect(() => {
    if (!supportsBackdropUrl()) return;
    const root = document.documentElement;
    root.setAttribute('data-liquid-lens', '');
    return () => root.removeAttribute('data-liquid-lens');
  }, []);

  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter
        id="tm-liquid-lens"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.011" numOctaves="2" seed="11" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="2.5" result="softNoise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="38"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
};
