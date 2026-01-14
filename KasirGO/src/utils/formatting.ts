export const formatCurrency = (amount: number): string => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
};
