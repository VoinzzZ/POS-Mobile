import axiosInstance from './axiosInstance';

export interface TransactionItem {
  productId: number;
  quantity: number;
}

export interface TransactionPayload {
  items: TransactionItem[];
}

export interface Transaction {
  id: number;
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
    email: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const transactionService = {
  // Create new transaction (draft)
  createTransaction: async (payload: TransactionPayload): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post('/transactions', payload);
    return response.data;
  },

  // Complete payment for transaction
  completePayment: async (
    transactionId: number, 
    paymentAmount: number,
    paymentMethod: 'CASH' | 'QRIS' | 'DEBIT' = 'CASH'
  ): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post(`/transactions/${transactionId}/complete`, {
      paymentAmount,
      paymentMethod
    });
    return response.data;
  },

  // Get receipt data for PDF generation
  getReceiptData: async (transactionId: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.get(`/transactions/${transactionId}/receipt`);
    return response.data;
  },

  // Get transaction detail
  getTransactionDetail: async (transactionId: number): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.get(`/transactions/${transactionId}`);
    return response.data;
  },

  // Get all transactions (history)
  getAllTransactions: async (params?: {
    startDate?: string;
    endDate?: string;
    cashierId?: number;
    status?: 'DRAFT' | 'COMPLETED' | 'LOCKED';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ data: Transaction[]; pagination: any }>> => {
    const response = await axiosInstance.get('/transactions', { params });
    return response.data;
  },

  // Update transaction (edit items)
  updateTransaction: async (transactionId: number, payload: TransactionPayload): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.put(`/transactions/${transactionId}`, payload);
    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (transactionId: number): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete(`/transactions/${transactionId}`);
    return response.data;
  }
};
