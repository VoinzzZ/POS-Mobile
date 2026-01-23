export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatCurrencyCompact = (amount: number): string => {
    if (amount >= 1000000000) {
        return `Rp ${(amount / 1000000000).toFixed(1)}M`;
    } else if (amount >= 1000000) {
        return `Rp ${(amount / 1000000).toFixed(1)}jt`;
    } else if (amount >= 1000) {
        return `Rp ${(amount / 1000).toFixed(0)}rb`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

export const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};

export const getDateRangeLabel = (range: 'week' | 'month' | 'year'): string => {
    const now = new Date();
    switch (range) {
        case 'week':
            return 'Minggu Ini';
        case 'month':
            return 'Bulan Ini';
        case 'year':
            return 'Tahun Ini';
        default:
            return 'Hari Ini';
    }
};

export const getDateRange = (range: 'today' | 'week' | 'month' | 'year'): { start_date: string; end_date: string } => {
    const now = new Date();
    let startDate: Date;

    switch (range) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate = new Date(now);
    }

    const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return {
        start_date: formatLocalDate(startDate),
        end_date: formatLocalDate(new Date()),
    };
};

export const formatDateShort = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
    }).format(date);
};

export const formatDateFull = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

export const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
};

export type ChangeIndicator = 'up' | 'down' | 'neutral';

export const getChangeIndicator = (value: number): ChangeIndicator => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
};

export const formatDateRangeLabel = (range: 'today' | 'week' | 'month' | 'year'): string => {
    const now = new Date();
    switch (range) {
        case 'today':
            return new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }).format(now);
        case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - 7);
            return `${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(weekStart)} - ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(now)}`;
        case 'month':
            const monthStart = new Date(now);
            monthStart.setMonth(now.getMonth() - 1);
            return new Intl.DateTimeFormat('id-ID', {
                month: 'long',
                year: 'numeric',
            }).format(now);
        case 'year':
            return new Intl.DateTimeFormat('id-ID', {
                year: 'numeric',
            }).format(now);
        default:
            return 'Semua Waktu';
    }
};

