import api from "./axiosInstance";

export interface LowStockNotification {
    product_id: number;
    product_name: string;
    product_sku: string | null;
    product_qty: number;
    product_min_stock: number;
    product_image_url: string | null;
    category: {
        category_id: number;
        category_name: string;
    } | null;
    brand: {
        brand_id: number;
        brand_name: string;
    } | null;
    severity: number;
}

export interface NotificationApiResponse {
    success: boolean;
    message?: string;
    data?: LowStockNotification[];
    count?: number;
    error?: string;
}

export const getLowStockNotifications = async (): Promise<NotificationApiResponse> => {
    const res = await api.get("/notifications/low-stock");
    return res.data;
};
