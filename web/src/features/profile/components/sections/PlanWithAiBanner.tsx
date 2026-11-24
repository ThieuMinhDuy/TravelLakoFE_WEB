import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot } from 'lucide-react';
import { buttonVariants } from '../../../../components/common/buttonVariants';

/** Banner kêu gọi lên kế hoạch chuyến đi tiếp theo cùng Trợ lý AI */
export const PlanWithAiBanner: React.FC = () => (
  <section className="ai-banner" aria-labelledby="ai-banner-title">
    <span className="ai-banner__icon" aria-hidden="true">
      <Bot className="w-7 h-7" />
    </span>
    <div className="ai-banner__text">
      <h2 id="ai-banner-title" className="ai-banner__title">
        Lên kế hoạch chuyến đi tiếp theo cùng Trợ lý AI
      </h2>
      <p className="ai-banner__desc">
        Cho biết số ngày, sở thích và ngân sách — TripMate tự lập lịch trình chi tiết từ những địa điểm có thật,
        kèm chi phí ước tính.
      </p>
    </div>
    <Link to="/trips" className={buttonVariants({ variant: 'accent', size: 'lg', className: 'ai-banner__cta' })}>
      Bắt đầu ngay
      <ArrowRight className="w-4 h-4" />
    </Link>
  </section>
);
