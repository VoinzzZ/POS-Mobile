import api from "./axiosInstance";

export interface ExpenseCategory {
    category_id: number;
    category_code: string;
    category_name: string;
    category_description: string | null;
    tenant_id: number | null;
    is_active: boolean;
    is_system: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateCategoryData {
    category_code: string;
    category_name: string;
    category_description?: string | null;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export const getAllExpenseCategories = async (
    is_active?: boolean,
    search?: string
): Promise<ApiResponse<ExpenseCategory[]>> => {
    const params: any = {};
    if (is_active !== undefined) params.is_active = is_active;
    if (search) params.search = search;

    const res = await api.get("/expense-categories", { params });
    return res.data;
};

export const getExpenseCategoryById = async (
    id: number
): Promise<ApiResponse<ExpenseCategory>> => {
    const res = await api.get(`/expense-categories/${id}`);
    return res.data;
};

export const createExpenseCategory = async (
    data: CreateCategoryData
): Promise<ApiResponse<ExpenseCategory>> => {
    const res = await api.post("/expense-categories", data);
    return res.data;
};

export const updateExpenseCategory = async (
    id: number,
    data: Partial<CreateCategoryData>
): Promise<ApiResponse<ExpenseCategory>> => {
    const res = await api.put(`/expense-categories/${id}`, data);
    return res.data;
};

export const deleteExpenseCategory = async (
    id: number
): Promise<ApiResponse> => {
    const res = await api.delete(`/expense-categories/${id}`);
    return res.data;
};

export const seedDefaultExpenseCategories = async (): Promise<ApiResponse> => {
    const res = await api.post("/expense-categories/seed");
    return res.data;
};
