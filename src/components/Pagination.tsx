"use client";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px",
        marginTop: "24px",
      }}
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          opacity: currentPage === 1 ? 0.45 : 1,
          cursor:
            currentPage === 1
              ? "not-allowed"
              : "pointer",
        }}
      >
        Sebelumnya
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          style={{
            minWidth: "42px",
            background:
              currentPage === page
                ? "linear-gradient(135deg, #00d9ff, #8b5cf6)"
                : "rgba(255,255,255,0.08)",
            border:
              currentPage === page
                ? "1px solid #8b5cf6"
                : "1px solid rgba(255,255,255,0.14)",
          }}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          opacity:
            currentPage === totalPages ? 0.45 : 1,
          cursor:
            currentPage === totalPages
              ? "not-allowed"
              : "pointer",
        }}
      >
        Berikutnya
      </button>
    </nav>
  );
}