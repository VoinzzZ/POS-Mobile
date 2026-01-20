import api from "./axiosInstance";

export interface ManualPurchaseData {
    product_id: number;
    quantity: number;
    total_price: number;
    notes?: string;
    purchase_date?: string;
}

export interface ManualPurchaseResponse {
    stock_movement: {
        movement_id: number;
        product_id: number;
        movement_type: string;
        quantity: number;
        cost_per_unit: number;
        before_qty: number;
        after_qty: number;
        reference_type: string;
        notes: string | null;
        created_at: string;
    };
    cash_transaction: {
        cash_transaction_id: number;
        transaction_number: string;
        transaction_type: string;
        amount: number;
        payment_method: string | null;
        category_type: string | null;
        description: string | null;
        transaction_date: string;
    };
    product: {
        product_id: number;
        product_name: string;
        old_qty: number;
        new_qty: number;
        old_cost: number;
        total_amount: number;
    };
}

export interface PurchaseSummary {
    total_purchase: number;
    transaction_count: number;
    by_payment_method: {
        CASH: number;
        QRIS: number;
        DEBIT: number;
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
    error?: string;
}

export const recordManualPurchase = async (
    data: ManualPurchaseData
): Promise<ApiResponse<ManualPurchaseResponse>> => {
    const res = await api.post("/manual-purchases", data);
    return res.data;
};

export const getPurchaseHistory = async (
    product_id?: number,
    payment_method?: string,
    start_date?: string,
    end_date?: string,
    page?: number,
    limit?: number
): Promise<ApiResponse<any[]>> => {
    const params: any = {};
    if (product_id) params.product_id = product_id;
    if (payment_method) params.payment_method = payment_method;
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const res = await api.get("/manual-purchases", { params });
    return res.data;
};

export const getPurchaseSummary = async (
    start_date?: string,
    end_date?: string
): Promise<ApiResponse<PurchaseSummary>> => {
    const params: any = {};
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;

    const res = await api.get("/manual-purchases/summary", { params });
    return res.data;
};
