import api from './axiosInstance';

export interface ReturnItem {
    product_id: number;
    quantity: number;
}

export interface ReturnItemDetail {
    return_item_id: number;
    return_id: number;
    product_id: number;
    quantity: number;
    price: string;
    subtotal: string;
    m_product?: {
        product_id: number;
        product_name: string;
        product_sku?: string;
        product_image_url?: string;
    };
}

export interface Return {
    return_id: number;
    return_number: number;
    original_transaction_id: number;
    tenant_id: number;
    cashier_id: number;
    return_total: string;
    refund_amount: string;
    refund_method: string;
    notes?: string;
    created_at: string;
    created_by?: number;
    t_return_item: ReturnItemDetail[];
    m_user?: {
        user_id: number;
        user_full_name?: string;
        user_name: string;
    };
}

export interface CreateReturnData {
    transaction_id: number;
    items: ReturnItem[];
    notes?: string;
}

export interface ReturnableTransaction {
    id: number;
    dailyNumber?: number;
    total: number;
    status: string;
    createdAt: string;
    completedAt?: string;
    items: Array<{
        id: number;
        productId: number;
        quantity: number;
        price: number;
        subtotal: number;
        product: {
            id: number;
            name: string;
            sku?: string;
            imageUrl?: string;
        };
    }>;
    cashier: {
        id: number;
        name: string;
    };
}

export const returnService = {
    async getReturnableTransactions(cashierId?: number) {
        try {
            const params: any = {};
            if (cashierId) {
                params.cashier_id = cashierId;
            }

            const response = await api.get('/returns/returnable-transactions', { params });

            if (response.data.success && response.data.data) {
                const transactions = response.data.data.map((t: any) => ({
                    id: t.transaction_id,
                    dailyNumber: t.transaction_number,
                    total: parseFloat(t.transaction_total),
                    status: t.transaction_status,
                    createdAt: t.transaction_created_at,
                    completedAt: t.transaction_completed_at,
                    items: (t.t_transaction_item || []).map((item: any) => ({
                        id: item.transaction_item_id,
                        productId: item.transaction_item_product_id,
                        quantity: item.transaction_item_quantity,
                        price: parseFloat(item.transaction_item_price),
                        subtotal: parseFloat(item.transaction_item_subtotal),
                        product: {
                            id: item.m_product.product_id,
                            name: item.m_product.product_name,
                            sku: item.m_product.product_sku,
                            imageUrl: item.m_product.product_image_url
                        }
                    })),
                    cashier: {
                        id: t.m_user.user_id,
                        name: t.m_user.user_full_name || t.m_user.user_name
                    }
                }));

                return {
                    success: true,
                    data: transactions
                };
            }

            return { success: false, message: 'Failed to fetch returnable transactions' };
        } catch (error: any) {
            console.error('Error fetching returnable transactions:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch returnable transactions'
            };
        }
    },

    async createReturn(data: CreateReturnData) {
        try {
            const response = await api.post('/returns', data);

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            }

            return {
                success: false,
                message: response.data.message || 'Failed to create return'
            };
        } catch (error: any) {
            console.error('Error creating return:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create return'
            };
        }
    },

    async getReturns(filters?: { start_date?: string; end_date?: string; cashier_id?: number; page?: number; limit?: number }) {
        try {
            const response = await api.get('/returns', { params: filters });

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    pagination: response.data.pagination
                };
            }

            return { success: false, message: 'Failed to fetch returns' };
        } catch (error: any) {
            console.error('Error fetching returns:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch returns'
            };
        }
    },

    async getReturnById(returnId: number) {
        try {
            const response = await api.get(`/returns/${returnId}`);

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }

            return { success: false, message: 'Return not found' };
        } catch (error: any) {
            console.error('Error fetching return:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch return'
            };
        }
    }
};
