export function ExploreLoading() {
  return (
    <div className="explore">
      <div className="explore-container explore-loading">
        <div className="explore-grid" role="status" aria-label="Đang tải trang">
          {Array.from({ length: 6 }, (_, i) => (
            <div className="explore-card-skeleton" key={i}>
              <div />
              <span />
              <span />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
