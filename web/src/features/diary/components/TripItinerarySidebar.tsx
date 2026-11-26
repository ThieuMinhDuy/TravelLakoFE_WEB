import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, ExternalLink, MapPin } from 'lucide-react';
import { useLocale } from '../../../contexts/locale/LocaleContext';
import type { TripDetail } from '../../../types/trip';
import { PLACE_TYPE_LABELS, toPlaceType } from '../../../utils/place';
import { getTripPlaceCount } from '../../../utils/trip';

export interface TripItinerarySidebarProps {
  trip: TripDetail;
}

/**
 * Cột tóm tắt lịch trình theo từng ngày (chỉ đọc) bên cạnh trình soạn nhật ký,
 * giúp người dùng nhớ lại các điểm đến đã đi qua.
 */
export const TripItinerarySidebar: React.FC<TripItinerarySidebarProps> = ({ trip }) => {
  const { formatDate } = useLocale();
  const totalPlaces = getTripPlaceCount(trip);

  return (
    <aside className="diary-panel diary-sidebar" aria-label="Lịch trình gợi nhớ">
      <div className="diary-sidebar__header">
        <h2 className="diary-sidebar__title">
          <CalendarDays className="w-4 h-4 text-[#FA8B02]" aria-hidden="true" />
          Lịch trình gợi nhớ ({totalPlaces} điểm)
        </h2>
        <Link
          to={`/trips/${trip._id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#9A4E00] hover:underline"
        >
          Mở lịch trình
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>

      {totalPlaces === 0 ? (
        <p className="text-sm text-[#667078] m-0">
          Chuyến đi này chưa có địa điểm nào trong lịch trình.
        </p>
      ) : (
        <div className="diary-sidebar__days">
          {trip.schedule.map((dayItem) => (
            <div key={dayItem._id || dayItem.day} className="diary-sidebar__day">
              <h3 className="diary-sidebar__day-title">
                Ngày {dayItem.day}
                {dayItem.date ? ` · ${formatDate(dayItem.date)}` : ''}
              </h3>

              {dayItem.places.length === 0 ? (
                <p className="text-xs text-[#667078] m-0">Chưa có địa điểm trong ngày này.</p>
              ) : (
                <ul className="diary-sidebar__places">
                  {dayItem.places.map((item) => {
                    const placeObj =
                      typeof item.placeId === 'object' && item.placeId !== null
                        ? item.placeId
                        : null;
                    const placeTypeSlug = toPlaceType(item.placeType);
                    const placeLabel = PLACE_TYPE_LABELS[placeTypeSlug] || item.placeType;

                    return (
                      <li key={item._id} className="diary-sidebar__place">
                        <div className="diary-sidebar__place-top">
                          {placeObj?._id ? (
                            <Link
                              to={`/places/${placeTypeSlug}/${placeObj._id}`}
                              className="diary-sidebar__place-name"
                            >
                              {placeObj.name}
                            </Link>
                          ) : (
                            <span className="diary-sidebar__place-name">Địa điểm đã lưu</span>
                          )}

                          {item.visited && (
                            <span className="diary-sidebar__visited">
                              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                              Đã ghé
                            </span>
                          )}
                        </div>

                        <div className="diary-sidebar__place-meta">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" aria-hidden="true" />
                            {placeLabel}
                          </span>
                        </div>

                        {item.note && <p className="diary-sidebar__place-note">"{item.note}"</p>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};

