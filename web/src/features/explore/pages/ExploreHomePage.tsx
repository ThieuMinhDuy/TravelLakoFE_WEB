import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Coffee,
  Compass,
  MapPin,
  Search,
  Utensils,
} from 'lucide-react';
import { travelImages } from '../../../assets/travel';
import { useCities } from '../hooks/useExploreQueries';
import {
  CardSkeletons,
  CityCard,
  ExploreFrame,
  Status,
} from '../components/ExploreUI';
import { messageOf } from '../utils';

const categories = [
  {
    kind: 'attraction',
    label: 'Điểm tham quan',
    icon: Compass,
    text: 'Những nơi đáng để dừng chân',
  },
  {
    kind: 'hotel',
    label: 'Khách sạn',
    icon: Building2,
    text: 'Tìm chốn nghỉ cho hành trình',
  },
  {
    kind: 'restaurant',
    label: 'Nhà hàng',
    icon: Utensils,
    text: 'Khám phá hương vị địa phương',
  },
  {
    kind: 'cafe',
    label: 'Quán cà phê',
    icon: Coffee,
    text: 'Chậm lại bên một tách cà phê',
  },
];
export function ExploreHomePage() {
  const cities = useCities();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [kind, setKind] = useState('');
  const search = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('search', keyword.trim());
    if (city) params.set('city', city);
    if (kind) params.set('type', kind);
    navigate(`/places${params.size ? `?${params}` : ''}`);
  };
  return (
    <ExploreFrame>
      <section
        className="explore-hero"
        style={{
          backgroundImage: `linear-gradient(180deg,rgba(10,27,36,.28),rgba(10,27,36,.36)),url("${travelImages.haLong.src}")`,
        }}
      >
        <div className="explore-hero-copy">
          <p className="explore-eyebrow">TRIPMATE · HÀNH TRÌNH CỦA BẠN</p>
          <h1>Tận hưởng từng khoảnh khắc!</h1>
          <p>
            Đi xa hơn, khám phá nhiều hơn. Bắt đầu chuyến đi Việt Nam theo cách
            của riêng bạn.
          </p>
        </div>
        <form
          className="explore-search-widget"
          onSubmit={search}
          aria-label="Tìm địa điểm du lịch"
        >
          <div className="explore-search-widget-tab">
            <Compass size={17} /> Khám phá điểm đến
          </div>
          <div className="explore-search-widget-fields">
            <label>
              <span>
                <Search size={16} />
                Bạn muốn đi đâu?
              </span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tên địa điểm…"
                aria-label="Tên địa điểm"
              />
            </label>
            <label>
              <span>
                <MapPin size={16} />
                Thành phố
              </span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="Thành phố"
              >
                <option value="">Tất cả thành phố</option>
                {cities.data?.map((c) => (
                  <option value={c._id} key={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>
                <Compass size={16} />
                Trải nghiệm
              </span>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                aria-label="Loại địa điểm"
              >
                <option value="">Tất cả loại hình</option>
                {categories.map((c) => (
                  <option key={c.kind} value={c.kind}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="explore-button" type="submit">
              <Search size={19} />
              Tìm kiếm
            </button>
          </div>
        </form>
        <span className="explore-hero-caption">
          <MapPin size={13} /> Vịnh Hạ Long, Việt Nam
        </span>
      </section>
      <div className="explore-container">
        <section className="explore-categories" aria-label="Danh mục địa điểm">
          {categories.map(({ kind: type, label, icon: Icon, text }) => (
            <Link to={`/places?type=${type}`} key={type}>
              <span>
                <Icon size={24} />
              </span>
              <div>
                <h2>{label}</h2>
                <p>{text}</p>
              </div>
              <ArrowRight size={17} />
            </Link>
          ))}
        </section>
        <section className="explore-section">
          <div className="explore-section-heading">
            <div>
              <p className="explore-eyebrow">Lên đường khám phá</p>
              <h2>Thành phố cho chuyến đi tiếp theo</h2>
            </div>
            <Link to="/cities" className="explore-text-link">
              Xem tất cả <ArrowRight size={17} />
            </Link>
          </div>
          {cities.isPending ? (
            <CardSkeletons />
          ) : cities.isError ? (
            <Status
              title="Chưa tải được thành phố"
              description={messageOf(cities.error)}
              retry={() => void cities.refetch()}
            />
          ) : cities.data.length ? (
            <div className="explore-grid explore-grid--four">
              {cities.data.slice(0, 4).map((c) => (
                <CityCard city={c} key={c._id} />
              ))}
            </div>
          ) : (
            <Status
              title="Những điểm đến mới đang chờ được cập nhật"
              description="Danh sách thành phố hiện chưa có nội dung. Bạn có thể quay lại sau hoặc khám phá các loại địa điểm."
            >
              <Link
                to="/places"
                className="explore-button explore-button--outline"
              >
                Khám phá địa điểm <ArrowRight size={16} />
              </Link>
            </Status>
          )}
        </section>
        <section className="explore-section">
          <div className="explore-section-heading">
            <div>
              <p className="explore-eyebrow">Cảm hứng trên từng cung đường</p>
              <h2>Một Việt Nam, nhiều sắc màu</h2>
              <p>
                Từ phố cổ bình yên đến những đường bờ biển và thành phố rực rỡ.
              </p>
            </div>
          </div>
          <div className="explore-inspiration">
            {[
              {
                photo: travelImages.hoiAn,
                title: 'Một chiều phố Hội',
                caption: 'Hội An',
              },
              {
                photo: travelImages.daNang,
                title: 'Thành phố bên sông',
                caption: 'Đà Nẵng',
              },
              {
                photo: travelImages.haNoi,
                title: 'Khoảng xanh giữa lòng phố',
                caption: 'Hà Nội',
              },
            ].map(({ photo, title, caption }) => (
              <figure key={caption}>
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  width="1200"
                  height="800"
                />
                <figcaption>
                  <span>{caption}</span>
                  <h3>{title}</h3>
                </figcaption>
              </figure>
            ))}
          </div>
          <details className="explore-photo-credits">
            <summary>Nguồn ảnh</summary>
            <p>Ảnh minh họa du lịch theo giấy phép CC0.</p>
            {Object.values(travelImages).map((photo) => (
              <a
                key={photo.src}
                href={photo.source}
                target="_blank"
                rel="noreferrer"
              >
                {photo.author} · {photo.alt}
              </a>
            ))}
          </details>
        </section>
      </div>
      <section className="explore-invite">
        <p className="explore-eyebrow">Một chuyến đi, nhiều trải nghiệm</p>
        <h2>Bắt đầu từ một nơi bạn muốn đến.</h2>
        <p>
          Khám phá, lưu lại những địa điểm yêu thích và chuẩn bị hành trình của
          riêng bạn.
        </p>
        <Link className="explore-button" to="/places">
          Tìm cảm hứng cho chuyến đi <ArrowRight size={18} />
        </Link>
      </section>
    </ExploreFrame>
  );
}
