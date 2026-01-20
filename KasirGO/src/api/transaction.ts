import axiosInstance from './axiosInstance';

export interface TransactionItem {
  product_id: number;
  quantity: number;
}

export interface TransactionPayload {
  items: TransactionItem[];
}

export interface Transaction {
  id: number;
  dailyNumber?: number;
  cashierId: number;
  total: number;
  paymentAmount?: number;
  changeAmount?: number;
  paymentMethod?: 'CASH' | 'QRIS' | 'DEBIT';
  status: 'DRAFT' | 'LOCKED' | 'COMPLETED';
  completedAt?: string;
  createdAt: string;
  items: {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    subtotal: number;
    product: {
      id: number;
      name: string;
      price: number;
      imageUrl?: string;
    };
  }[];
  cashier?: {
    userName: string;
    userEmail: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Transform function to convert server data (snake_case) to client interface (camelCase)
export const transformTransaction = (serverData: any): Transaction => {
  return {
    id: serverData.transaction_id,
    dailyNumber: serverData.transaction_number,
    cashierId: serverData.transaction_cashier_id,
    total: serverData.transaction_total,
    paymentAmount: serverData.transaction_payment_amount,
    changeAmount: serverData.transaction_change_amount,
    paymentMethod: serverData.transaction_payment_method,
    status: serverData.transaction_status,
    completedAt: serverData.transaction_completed_at,
    createdAt: serverData.transaction_created_at,
    items: serverData.items?.map((item: any) => ({
      id: item.transaction_item_id,
      productId: item.transaction_item_product_id,
      quantity: item.transaction_item_quantity,
      price: item.transaction_item_price,
      subtotal: item.transaction_item_subtotal,
      product: {
        id: item.product.product_id,
        name: item.product.product_name,
        price: item.product.product_price,
        imageUrl: item.product.product_image_url,
      },
    })) || [],
    cashier: serverData.cashier ? {
      userName: serverData.cashier.user_name,
      userEmail: serverData.cashier.user_email,
    } : undefined,
  };
};

export const transformTransactions = (serverData: any[]): Transaction[] => {
  return serverData.map(transformTransaction);
};

export const transactionService = {
  // Create new transaction (draft)
  createTransaction: async (payload: TransactionPayload): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post('/transactions', payload);

    // Transform the server data to match our interface
    if (response.data.success && response.data.data) {
      const transformedData = {
        ...response.data,
        data: transformTransaction(response.data.data)
      };
      return transformedData;
    }

    return response.data;
  },

  // Update existing transaction (draft)
  updateTransaction: async (transactionId: number, payload: TransactionPayload): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.put(`/transactions/${transactionId}`, payload);

    // Transform the server data to match our interface
    if (response.data.success && response.data.data) {
      const transformedData = {
        ...response.data,
        data: transformTransaction(response.data.data)
      };
      return transformedData;
    }

    return response.data;
  },

  // Complete payment for transaction
  completePayment: async (
    transactionId: number,
    payment_amount: number,
    payment_method: 'CASH' | 'QRIS' | 'DEBIT' = 'CASH'
  ): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post(`/transactions/${transactionId}/complete`, {
      payment_amount,
      payment_method
    });

    // Transform the server data to match our interface
    if (response.data.success && response.data.data) {
      const transformedData = {
        ...response.data,
        data: transformTransaction(response.data.data)
      };
      return transformedData;
    }

    return response.data;
  },

  // Get receipt data for PDF generation
  getReceiptData: async (transactionId: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.get(`/transactions/${transactionId}/receipt`);

    // Transform the server data to match our interface
    if (response.data.success && response.data.data) {
      const transformedData = {
        ...response.data,
        data: transformTransaction(response.data.data)
      };
      return transformedData;
    }

    return response.data;
  },

  // Get transaction detail
  getTransactionDetail: async (transactionId: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.get(`/transactions/${transactionId}`);

    // Transform the server data to match our interface
    if (response.data.success && response.data.data) {
      const transformedData = {
        ...response.data,
        data: transformTransaction(response.data.data)
      };
      return transformedData;
    }

    return response.data;
  },

  // Get all transactions (history)
  getAllTransactions: async (params?: {
    start_date?: string;
    end_date?: string;
    cashier_id?: number;
    status?: 'DRAFT' | 'COMPLETED' | 'LOCKED';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ data: Transaction[]; pagination: any }>> => {
    const response = await axiosInstance.get('/transactions', { params });

    // Transform the server data to match our interface
    if (response.data.success && response.data.data) {
      const transformedData = {
        ...response.data,
        data: {
          data: transformTransactions(response.data.data.data || response.data.data),
          pagination: response.data.data.pagination
        }
      };
      return transformedData;
    }

    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (transactionId: number): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`/transactions/${transactionId}`);
    return response.data;
  },

  getDashboardStats: async (): Promise<ApiResponse<{
    todaySales: number;
    transactionCount: number;
    averageSale: number;
    recentTransactions: Transaction[];
    paymentMethodBreakdown: {
      CASH: { total: number; count: number };
      QRIS: { total: number; count: number };
      DEBIT: { total: number; count: number };
    };
  }>> => {
    const response = await axiosInstance.get('/transactions/dashboard/stats');

    if (response.data.success && response.data.data) {
      const transformedData = {
        ...response.data,
        data: {
          ...response.data.data,
          recentTransactions: transformTransactions(response.data.data.recentTransactions)
        }
      };
      return transformedData;
    }

    return response.data;
  },

  getTopProducts: async (limit: number = 5): Promise<ApiResponse<{
    topProducts: Array<{
      product_id: number;
      product_name: string;
      total_quantity: number;
      total_revenue: number;
    }>;
  }>> => {
    const response = await axiosInstance.get('/dashboard/top-products', { params: { limit } });
    return response.data;
  }
};