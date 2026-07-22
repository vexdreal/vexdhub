"use client";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="button-ghost" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>←</button>
      {pages.map((page) => (
        <button
          type="button"
          key={page}
          className={currentPage === page ? "page-button active" : "page-button"}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button type="button" className="button-ghost" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>→</button>
    </nav>
  );
}
