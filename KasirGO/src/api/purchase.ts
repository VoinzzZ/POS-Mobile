import api from "./axiosInstance";

export interface PurchaseOrderItem {
    po_item_id: number;
    po_id: number;
    product_id: number;
    quantity: number;
    cost_per_unit: number;
    subtotal: number;
    m_product?: {
        product_id: number;
        product_name: string;
        product_sku: string | null;
        product_qty?: number;
    };
}

export interface PurchaseOrder {
    po_id: number;
    po_number: string;
    supplier_name: string;
    po_date: string;
    po_status: 'DRAFT' | 'PENDING' | 'RECEIVED' | 'CANCELLED';
    total_amount: number;
    notes: string | null;
    tenant_id: number;
    created_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
    received_at: string | null;
    t_purchase_order_item: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderData {
    supplier_name: string;
    po_date: string;
    items: Array<{
        product_id: number;
        quantity: number;
        cost_per_unit: number;
    }>;
    notes?: string;
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

export const createPurchaseOrder = async (
    data: CreatePurchaseOrderData
): Promise<ApiResponse<PurchaseOrder>> => {
    const res = await api.post("/purchases", data);
    return res.data;
};

export const getPurchaseOrders = async (filters?: {
    po_status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
}): Promise<ApiResponse<PurchaseOrder[]>> => {
    const res = await api.get("/purchases", { params: filters });
    return res.data;
};

export const getPurchaseOrderById = async (
    poId: number
): Promise<ApiResponse<PurchaseOrder>> => {
    const res = await api.get(`/purchases/${poId}`);
    return res.data;
};

export const updatePurchaseOrder = async (
    poId: number,
    data: {
        supplier_name?: string;
        po_date?: string;
        notes?: string;
    }
): Promise<ApiResponse<PurchaseOrder>> => {
    const res = await api.put(`/purchases/${poId}`, data);
    return res.data;
};

export const receivePurchaseOrder = async (
    poId: number
): Promise<ApiResponse<any>> => {
    const res = await api.post(`/purchases/${poId}/receive`);
    return res.data;
};

export const cancelPurchaseOrder = async (
    poId: number
): Promise<ApiResponse<PurchaseOrder>> => {
    const res = await api.delete(`/purchases/${poId}`);
    return res.data;
};
