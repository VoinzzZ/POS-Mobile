export const calculateProfitMargin = (cost: number, price: number): number => {
    if (cost <= 0) return 0;
    return ((price - cost) / cost) * 100;
};

export const calculateMarkup = (cost: number, price: number): number => {
    if (price <= 0) return 0;
    return ((price - cost) / price) * 100;
};

export const calculateInventoryValue = (products: Array<{
    product_qty: number;
    product_price: number;
    product_cost?: number | null;
}>): {
    totalCostValue: number;
    totalSellingValue: number;
    totalPotentialProfit: number;
} => {
    let totalCostValue = 0;
    let totalSellingValue = 0;

    products.forEach(product => {
        const cost = product.product_cost || 0;
        totalCostValue += cost * product.product_qty;
        totalSellingValue += product.product_price * product.product_qty;
    });

    return {
        totalCostValue,
        totalSellingValue,
        totalPotentialProfit: totalSellingValue - totalCostValue
    };
};

export const calculateWAC = (
    existingCost: number,
    existingQty: number,
    newCost: number,
    newQty: number
): number => {
    const totalCost = (existingCost * existingQty) + (newCost * newQty);
    const totalQty = existingQty + newQty;
    return totalQty > 0 ? totalCost / totalQty : 0;
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
};

export const getStockStatus = (qty: number, minQty: number): 'OK' | 'LOW' | 'OUT' => {
    if (qty === 0) return 'OUT';
    if (qty <= minQty) return 'LOW';
    return 'OK';
};

export const getStockStatusColor = (status: 'OK' | 'LOW' | 'OUT'): string => {
    switch (status) {
        case 'OUT':
            return '#ef4444';
        case 'LOW':
            return '#f59e0b';
        case 'OK':
            return '#10b981';
    }
};

export const getMovementTypeColor = (type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN'): string => {
    switch (type) {
        case 'IN':
        case 'RETURN':
            return '#10b981';
        case 'OUT':
            return '#ef4444';
        case 'ADJUSTMENT':
            return '#3b82f6';
    }
};

export const getMovementTypeLabel = (type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN'): string => {
    switch (type) {
        case 'IN':
            return 'Masuk';
        case 'OUT':
            return 'Keluar';
        case 'ADJUSTMENT':
            return 'Penyesuaian';
        case 'RETURN':
            return 'Retur';
    }
};

export const getPOStatusColor = (status: 'DRAFT' | 'PENDING' | 'RECEIVED' | 'CANCELLED'): string => {
    switch (status) {
        case 'DRAFT':
            return '#6b7280';
        case 'PENDING':
            return '#f59e0b';
        case 'RECEIVED':
            return '#10b981';
        case 'CANCELLED':
            return '#ef4444';
    }
};

export const getPOStatusLabel = (status: 'DRAFT' | 'PENDING' | 'RECEIVED' | 'CANCELLED'): string => {
    switch (status) {
        case 'DRAFT':
            return 'Draft';
        case 'PENDING':
            return 'Pending';
        case 'RECEIVED':
            return 'Diterima';
        case 'CANCELLED':
            return 'Dibatalkan';
    }
};
