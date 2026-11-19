import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';
import { PLACE_TYPES, PLACE_TYPE_LABELS } from '../../utils/place';
import type { City } from '../../types/city';
import { CardImage } from './CardImage';
import './css/Cards.css';

export interface CityCardProps {
  city: City;
  className?: string;
}

/** Thẻ thành phố: ảnh kèm tên, bên dưới là lối tắt tới từng loại địa điểm trong thành phố */
export const CityCard: React.FC<CityCardProps> = ({ city, className }) => (
  <article className={cn('city-card', className)}>
    <Link to={`/places?city=${city._id}`} className="city-card__media">
      <CardImage src={city.image} alt={city.name} className="city-card__img" fallbackIcon={<MapPin className="w-8 h-8" />} />
      <h3 className="city-card__name">{city.name}</h3>
    </Link>
    <ul className="city-card__links">
      {PLACE_TYPES.map((type) => (
        <li key={type}>
          <Link to={`/places?city=${city._id}&type=${type}`} className="city-card__link">
            {PLACE_TYPE_LABELS[type]} tại {city.name}
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  </article>
);
