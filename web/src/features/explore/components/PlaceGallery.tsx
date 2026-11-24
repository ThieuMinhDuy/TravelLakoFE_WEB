import { useEffect, useRef, useState } from 'react';
import { Images, X } from 'lucide-react';
import { Photo } from './ExploreUI';

function GalleryDialog({
  images,
  name,
  onClose,
}: {
  images: string[];
  name: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="explore-gallery-dialog"
      aria-label={`Ảnh của ${name}`}
      onCancel={onClose}
      onClose={onClose}
    >
      <header>
        <h2>{name}</h2>
        <button
          type="button"
          onClick={onClose}
          className="explore-icon-button"
          aria-label="Đóng thư viện ảnh"
        >
          <X />
        </button>
      </header>
      <div>
        {images.map((src, i) => (
          <Photo key={`${src}-${i}`} src={src} alt={`${name} - ảnh ${i + 1}`} />
        ))}
      </div>
    </dialog>
  );
}
export function PlaceGallery({
  images = [],
  name,
}: {
  images?: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  return (
    <div className="explore-gallery">
      <div className="explore-gallery-main">
        <Photo src={images[active]} alt={name} eager />
        {images.length > 1 && (
          <button
            className="explore-gallery-open"
            type="button"
            onClick={() => setOpen(true)}
          >
            <Images size={16} />
            Xem {images.length} ảnh
          </button>
        )}
      </div>
      {images.length > 1 && (
        <div className="explore-gallery-thumbs">
          {images.map((src, i) => (
            <button
              type="button"
              key={`${src}-${i}`}
              aria-label={`Xem ảnh ${i + 1} của ${name}`}
              aria-pressed={active === i}
              onClick={() => setActive(i)}
            >
              <Photo src={src} alt={`${name} - ảnh ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
      {open && (
        <GalleryDialog
          images={images}
          name={name}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
