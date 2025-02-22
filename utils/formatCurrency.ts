export const formatCurrency = (value: number | string): string => {
    if (!value) return ''; // Ensure empty input when the field is cleared
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0, // Remove decimal values
    }).format(num);
};
