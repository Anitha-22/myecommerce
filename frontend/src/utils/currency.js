// frontend/src/utils/currency.js

/**
 * Formats a number into Indian Rupees (INR) currency string.
 * @param {number} amount - The price amount to format.
 * @returns {string} - The formatted currency string (e.g., "₹ 1,234.56")
 */
export const formatIndianRupee = (amount) => {
    if (typeof amount !== 'number') {
        // Handle cases where amount might be undefined or null gracefully
        return 'N/A';
    }
    
    // Using Intl.NumberFormat for locale-specific currency formatting
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
};