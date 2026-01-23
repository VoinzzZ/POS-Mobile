import api from "./axiosInstance";

export interface StockMovement {
    movement_id: number;
    product_id: number;
    movement_type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';
    quantity: number;
    cost_per_unit: number | null;
    reference_type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN' | 'OPNAME';
    reference_id: number | null;
    notes: string | null;
    before_qty: number;
    after_qty: number;
    tenant_id: number;
    created_by: number | null;
    created_at: string;
    m_product?: {
        product_id: number;
        product_name: string;
        product_sku: string | null;
        product_price: number;
    };
}

export interface InventoryValuation {
    summary: {
        total_products: number;
        total_cost_value: number;
        total_selling_value: number;
        total_potential_profit: number;
        average_profit_margin: number;
        low_stock_count: number;
        out_of_stock_count: number;
    };
    products: Array<{
        product_id: number;
        product_name: string;
        product_sku: string | null;
        quantity: number;
        cost_per_unit: number;
        price_per_unit: number;
        cost_value: number;
        selling_value: number;
        potential_profit: number;
        profit_margin: number;
    }>;
}

export interface LowStockProduct {
    product_id: number;
    product_name: string;
    product_sku: string | null;
    product_qty: number;
    product_min_stock: number;
    product_price: number;
    product_cost: number | null;
    shortage: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
    };
}

export const createStockMovement = async (data: {
    product_id: number;
    movement_type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';
    quantity: number;
    cost_per_unit?: number;
    reference_type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN' | 'OPNAME';
    reference_id?: number;
    notes?: string;
}): Promise<ApiResponse<StockMovement>> => {
    const res = await api.post("/stock/movements", data);
    return res.data;
};

export const getStockMovements = async (filters?: {
    product_id?: number;
    movement_type?: string;
    reference_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
}): Promise<ApiResponse<StockMovement[]>> => {
    const res = await api.get("/stock/movements", { params: filters });
    return res.data;
};

export const getStockMovementsByProduct = async (
    productId: number,
    limit?: number
): Promise<ApiResponse<StockMovement[]>> => {
    const res = await api.get(`/stock/movements/product/${productId}`, {
        params: { limit }
    });
    return res.data;
};

export const getInventoryValuation = async (): Promise<ApiResponse<InventoryValuation>> => {
    const res = await api.get("/stock/valuation");
    return res.data;
};

export const getLowStockProducts = async (): Promise<ApiResponse<LowStockProduct[]>> => {
    const res = await api.get("/stock/low-stock");
    return res.data;
};

export const getDeadStockProducts = async (days?: number): Promise<ApiResponse<any[]>> => {
    const res = await api.get("/stock/dead-stock", { params: { days } });
    return res.data;
};

export interface StockMovementStatistics {
    incoming_total: number;
    return_total: number;
    outgoing_transaction_total: number;
    outgoing_nontransaction_total: number;
}

export const getStockMovementStatistics = async (filters?: {
    start_date?: string;
    end_date?: string;
}): Promise<ApiResponse<StockMovementStatistics>> => {
    const res = await api.get("/stock/movement-statistics", { params: filters });
    return res.data;
};

