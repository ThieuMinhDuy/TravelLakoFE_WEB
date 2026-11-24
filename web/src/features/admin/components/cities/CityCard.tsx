import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { CardImage } from '../../../../components/cards/CardImage';
import type { City } from '../../../../types/city';

interface CityCardProps {
  city: City;
  onEdit: () => void;
  onDelete: () => void;
}

const formatCoord = (n: number) => n.toFixed(4);

/** Thẻ thành phố: ảnh banner + tấm kính phía dưới chứa tên, tọa độ và thao tác */
export const CityCard: React.FC<CityCardProps> = ({ city, onEdit, onDelete }) => (
  <article className="admin-city glass glass--interactive">
    <button type="button" className="admin-city__media" onClick={onEdit} aria-label={`Sửa ${city.name}`}>
      <CardImage
        src={city.image}
        alt=""
        className="admin-city__img"
        fallbackIcon={<Building2 className="w-8 h-8" />}
      />
    </button>

    <div className="admin-city__body">
      <div className="admin-city__title-row">
        <h3 className="admin-city__name">{city.name}</h3>
        <div className="admin-row-actions">
          <button type="button" className="admin-icon-btn" onClick={onEdit} aria-label={`Sửa ${city.name}`} title="Sửa">
            <Pencil />
          </button>
          <button
            type="button"
            className="admin-icon-btn admin-icon-btn--danger"
            onClick={onDelete}
            aria-label={`Xóa ${city.name}`}
            title="Xóa"
          >
            <Trash2 />
          </button>
        </div>
      </div>

      <p className="admin-city__coords">
        <MapPin aria-hidden="true" />
        {formatCoord(city.coordinates.lat)}, {formatCoord(city.coordinates.lng)}
      </p>

      <p className="admin-city__desc">{city.description || <span className="admin-muted">Chưa có mô tả</span>}</p>

      <div className="admin-city__links">
        <Link to={`/admin/places?city=${city._id}`} className="admin-city__link">
          <MapPin aria-hidden="true" />
          Địa điểm
        </Link>
        <Link to={`/admin/reviews?city=${city._id}`} className="admin-city__link">
          <MessageSquare aria-hidden="true" />
          Đánh giá
        </Link>
      </div>
    </div>
  </article>
);
