"use client";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const allPages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visiblePages = allPages.filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
  );

  return (
    <nav className="pagination" aria-label="License pages">
      <button type="button" className="button-secondary" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        Previous
      </button>
      <div className="pagination-pages">
        {visiblePages.map((page, index) => {
          const previous = visiblePages[index - 1];
          return (
            <span key={page} className="pagination-group">
              {previous && page - previous > 1 ? <span className="pagination-gap">…</span> : null}
              <button
                type="button"
                className={currentPage === page ? "page-button active" : "page-button"}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            </span>
          );
        })}
      </div>
      <button type="button" className="button-secondary" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        Next
      </button>
    </nav>
  );
}
