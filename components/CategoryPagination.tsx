'use client';

import { cn } from "@/lib/utils";

interface CategoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CategoryPagination = ({ currentPage, totalPages, onPageChange }: CategoryPaginationProps) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "px-3 py-2 text-sm font-medium border transition-colors",
          currentPage === 1
            ? "border-muted text-muted-foreground cursor-not-allowed"
            : "border-foreground text-foreground hover:bg-foreground hover:text-background"
        )}
      >
        Trước
      </button>

      {/* Page Numbers */}
      {pages.map((page, index) => (
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-10 h-10 text-sm font-medium border transition-colors",
              page === currentPage
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-foreground hover:bg-foreground hover:text-background"
            )}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-2 text-muted-foreground">
            {page}
          </span>
        )
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "px-3 py-2 text-sm font-medium border transition-colors",
          currentPage === totalPages
            ? "border-muted text-muted-foreground cursor-not-allowed"
            : "border-foreground text-foreground hover:bg-foreground hover:text-background"
        )}
      >
        Sau
      </button>
    </nav>
  );
};

export default CategoryPagination;
