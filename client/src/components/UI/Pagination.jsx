import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable Pagination component matching the application's premium aesthetic.
 *
 * @param {Object} props
 * @param {number} props.page - The current page (1-indexed).
 * @param {number} props.totalPages - The total number of pages.
 * @param {function} props.setPage - Callback to change the page.
 * @param {function} props.nextPage - Callback to go to the next page.
 * @param {function} props.prevPage - Callback to go to the previous page.
 */
export default function Pagination({ page, totalPages, setPage, nextPage, prevPage }) {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];

        // If totalPages is small, just show all pages
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            page === i
                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                : "bg-white text-gray-500 hover:bg-gray-100 hover:text-primary border border-gray-100"
                        }`}
                    >
                        {i}
                    </button>
                );
            }
            return pages;
        }

        // Robust ellipsis pagination: Show 1, current page context, and totalPages
        // Page 1
        pages.push(
            <button
                key={1}
                onClick={() => setPage(1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    page === 1
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-white text-gray-500 hover:bg-gray-100 hover:text-primary border border-gray-100"
                }`}
            >
                1
            </button>
        );

        // First Ellipsis
        if (page > 3) {
            pages.push(
                <span key="el1" className="text-gray-400 text-xs px-1 select-none">
                    ...
                </span>
            );
        }

        // Dynamic middle section: page - 1, page, page + 1
        const start = Math.max(2, page - 1);
        const end = Math.min(totalPages - 1, page + 1);
        for (let i = start; i <= end; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        page === i
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "bg-white text-gray-500 hover:bg-gray-100 hover:text-primary border border-gray-100"
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Second Ellipsis
        if (page < totalPages - 2) {
            pages.push(
                <span key="el2" className="text-gray-400 text-xs px-1 select-none">
                    ...
                </span>
            );
        }

        // Last Page
        pages.push(
            <button
                key={totalPages}
                onClick={() => setPage(totalPages)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    page === totalPages
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-white text-gray-500 hover:bg-gray-100 hover:text-primary border border-gray-100"
                }`}
            >
                {totalPages}
            </button>
        );

        return pages;
    };

    return (
        <div className="flex items-center gap-1.5 select-none">
            <button
                onClick={prevPage}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 bg-white text-gray-500 hover:bg-gray-150 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {renderPageNumbers()}

            <button
                onClick={nextPage}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 bg-white text-gray-500 hover:bg-gray-150 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
