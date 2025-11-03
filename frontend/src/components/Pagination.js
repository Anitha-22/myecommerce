// frontend/src/components/Pagination.js
import React from 'react';
import './Pagination.css'; // We'll create this CSS file

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Don't render pagination if there's only one page
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const delta = 2; // Number of pages to show on each side of current page
        const range = [];
        const rangeWithDots = [];

        // Calculate range of pages to show
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || // First page
                i === totalPages || // Last page
                (i >= currentPage - delta && i <= currentPage + delta) // Pages around current
            ) {
                range.push(i);
            }
        }

        // Add dots where there are gaps
        let prevPage = 0;
        for (const page of range) {
            if (prevPage) {
                if (page - prevPage === 2) {
                    rangeWithDots.push(prevPage + 1);
                } else if (page - prevPage > 2) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(page);
            prevPage = page;
        }

        return rangeWithDots;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="pagination-container">
            <nav className="pagination-nav" aria-label="Product pagination">
                <ul className="pagination-list">
                    {/* Previous Button */}
                    <li className="pagination-item">
                        <button
                            className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                        >
                            <PreviousIcon />
                        </button>
                    </li>

                    {/* Page Numbers */}
                    {visiblePages.map((page, index) => (
                        <li key={index} className="pagination-item">
                            {page === '...' ? (
                                <span className="pagination-dots" aria-hidden="true">
                                    ...
                                </span>
                            ) : (
                                <button
                                    className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                                    onClick={() => onPageChange(page)}
                                    aria-label={`Page ${page}`}
                                    aria-current={currentPage === page ? 'page' : null}
                                >
                                    {page}
                                </button>
                            )}
                        </li>
                    ))}

                    {/* Next Button */}
                    <li className="pagination-item">
                        <button
                            className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            aria-label="Next page"
                        >
                            <NextIcon />
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Optional: Page info */}
            <div className="pagination-info">
                Page {currentPage} of {totalPages}
            </div>
        </div>
    );
};

// Simple SVG icons for previous/next
const PreviousIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
    </svg>
);

const NextIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
    </svg>
);

export default Pagination;