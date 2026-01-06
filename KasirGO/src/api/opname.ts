import api from "./axiosInstance";

export interface StockOpname {
    opname_id: number;
    product_id: number;
    system_qty: number;
    actual_qty: number;
    difference: number;
    notes: string | null;
    tenant_id: number;
    created_by: number | null;
    created_at: string;
    processed: boolean;
    processed_at: string | null;
    m_product?: {
        product_id: number;
        product_name: string;
        product_sku: string | null;
        product_price: number;
        product_cost: number | null;
    };
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

export const createStockOpname = async (data: {
    product_id: number;
    actual_qty: number;
    notes?: string;
}): Promise<ApiResponse<StockOpname>> => {
    const res = await api.post("/opname", data);
    return res.data;
};

export const bulkCreateStockOpname = async (data: {
    opnames: Array<{
        product_id: number;
        actual_qty: number;
        notes?: string;
    }>;
}): Promise<ApiResponse<StockOpname[]>> => {
    const res = await api.post("/opname/bulk", data);
    return res.data;
};

export const getStockOpnames = async (filters?: {
    product_id?: number;
    processed?: boolean;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
}): Promise<ApiResponse<StockOpname[]>> => {
    const res = await api.get("/opname", { params: filters });
    return res.data;
};

export const processStockOpname = async (
    opnameId: number
): Promise<ApiResponse<any>> => {
    const res = await api.post(`/opname/${opnameId}/process`);
    return res.data;
};
