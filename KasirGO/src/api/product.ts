import api from "./axiosInstance";

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  brandId: number | null;
  categoryId: number | null;
  brand?: {
    id: number;
    name: string;
  } | null;
  category?: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  brandId?: number | null;
  categoryId?: number | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Get all products with optional filters
 * @param search - Search term for product name
 * @param categoryId - Filter by category ID
 * @param brandId - Filter by brand ID
 */
export const getAllProducts = async (
  search?: string,
  categoryId?: number,
  brandId?: number
): Promise<ApiResponse<Product[]>> => {
  const params: any = {};
  if (search) params.search = search;
  if (categoryId) params.categoryId = categoryId;
  if (brandId) params.brandId = brandId;

  const res = await api.get("/product", { params });
  return res.data;
};

/**
 * Get product by ID
 * @param id - Product ID
 */
export const getProductById = async (
  id: number
): Promise<ApiResponse<Product>> => {
  const res = await api.get(`/product/${id}`);
  return res.data;
};

/**
 * Create new product
 * @param data - Product data
 */
export const createProduct = async (
  data: CreateProductData
): Promise<ApiResponse<Product>> => {
  const res = await api.post("/product", data);
  return res.data;
};

/**
 * Update product
 * @param id - Product ID
 * @param data - Updated product data
 */
export const updateProduct = async (
  id: number,
  data: Partial<CreateProductData>
): Promise<ApiResponse<Product>> => {
  const res = await api.put(`/product/${id}`, data);
  return res.data;
};

/**
 * Delete product
 * @param id - Product ID
 */
export const deleteProduct = async (
  id: number
): Promise<ApiResponse> => {
  const res = await api.delete(`/product/${id}`);
  return res.data;
};

/**
 * Get all categories
 */
export const getAllCategories = async (): Promise<ApiResponse<Category[]>> => {
  const res = await api.get("/category");
  return res.data;
};

/**
 * Get all brands
 */
export const getAllBrands = async (): Promise<ApiResponse<Brand[]>> => {
  const res = await api.get("/brand");
  return res.data;
};

/**
 * Create new category
 * @param name - Category name
 */
export const createCategory = async (
  name: string
): Promise<ApiResponse<Category>> => {
  const res = await api.post("/category", { name });
  return res.data;
};

/**
 * Update category
 * @param id - Category ID
 * @param name - New category name
 */
export const updateCategory = async (
  id: number,
  name: string
): Promise<ApiResponse<Category>> => {
  const res = await api.put(`/category/${id}`, { name });
  return res.data;
};

/**
 * Delete category
 * @param id - Category ID
 */
export const deleteCategory = async (
  id: number
): Promise<ApiResponse> => {
  const res = await api.delete(`/category/${id}`);
  return res.data;
};

/**
 * Create new brand
 * @param name - Brand name
 */
export const createBrand = async (
  name: string
): Promise<ApiResponse<Brand>> => {
  const res = await api.post("/brand", { name });
  return res.data;
};

/**
 * Update brand
 * @param id - Brand ID
 * @param name - New brand name
 */
export const updateBrand = async (
  id: number,
  name: string
): Promise<ApiResponse<Brand>> => {
  const res = await api.put(`/brand/${id}`, { name });
  return res.data;
};

/**
 * Delete brand
 * @param id - Brand ID
 */
export const deleteBrand = async (
  id: number
): Promise<ApiResponse> => {
  const res = await api.delete(`/brand/${id}`);
  return res.data;
};

/**
 * Upload product image
 * @param imageUri - Local image URI from image picker
 * @param productName - Product name for filename
 */
export const uploadProductImage = async (
  imageUri: string,
  productName: string
): Promise<string> => {
  // Create FormData
  const formData = new FormData();
  
  // Extract file extension
  const uriParts = imageUri.split('.');
  const fileType = uriParts[uriParts.length - 1];
  
  // Create file object for upload
  const file: any = {
    uri: imageUri,
    name: `${productName.replace(/\s/g, '_')}_${Date.now()}.${fileType}`,
    type: `image/${fileType}`,
  };
  
  formData.append('image', file);
  
  // Upload to server
  const res = await api.post("/upload/product-image", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return res.data.data.imageUrl;
};
