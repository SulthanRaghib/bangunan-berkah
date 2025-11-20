function calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.max(0, end - start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getDaysRemaining(endDate) {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diff = end - today;
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

module.exports = { calculateDuration, getDaysRemaining };
