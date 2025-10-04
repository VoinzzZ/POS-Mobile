import api from "./axiosInstance";

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  brandId: number | null;
  brand?: {
    id: number;
    name: string;
    categoryId: number | null;
    category?: {
      id: number;
      name: string;
    } | null;
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
  categoryId: number | null;
  category?: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  brandId?: number | null;
  image?: any;
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
  // If image is provided, use FormData
  if (data.image) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', data.price.toString());
    formData.append('stock', data.stock.toString());
    if (data.brandId) formData.append('brandId', data.brandId.toString());
    formData.append('image', data.image);
    
    const res = await api.post("/product", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
  
  // Otherwise, use regular JSON
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
  // If image is provided, use FormData
  if (data.image) {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.price) formData.append('price', data.price.toString());
    if (data.stock) formData.append('stock', data.stock.toString());
    if (data.brandId) formData.append('brandId', data.brandId.toString());
    formData.append('image', data.image);
    
    const res = await api.put(`/product/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
  
  // Otherwise, use regular JSON
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
 * @param categoryId - Optional category ID
 */
export const createBrand = async (
  name: string,
  categoryId?: number | null
): Promise<ApiResponse<Brand>> => {
  const res = await api.post("/brand", { name, categoryId });
  return res.data;
};

/**
 * Update brand
 * @param id - Brand ID
 * @param name - New brand name
 * @param categoryId - Optional category ID
 */
export const updateBrand = async (
  id: number,
  name: string,
  categoryId?: number | null
): Promise<ApiResponse<Brand>> => {
  const res = await api.put(`/brand/${id}`, { name, categoryId });
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
 * Get products by category ID
 * @param categoryId - Category ID to filter by
 */
export const getProductsByCategory = async (
  categoryId: number
): Promise<ApiResponse<Product[]>> => {
  return getAllProducts(undefined, categoryId);
};

/**
 * Get products by brand ID
 * @param brandId - Brand ID to filter by
 */
export const getProductsByBrand = async (
  brandId: number
): Promise<ApiResponse<Product[]>> => {
  return getAllProducts(undefined, undefined, brandId);
};

/**
 * Prepare image file object for upload
 * @param imageUri - Local image URI from image picker
 * @param productName - Product name for filename
 */
export const prepareImageFile = (imageUri: string, productName: string): any => {
  // Extract file extension
  const uriParts = imageUri.split('.');
  const fileType = uriParts[uriParts.length - 1];
  
  // Create file object for upload
  return {
    uri: imageUri,
    name: `${productName.replace(/\s/g, '_')}_${Date.now()}.${fileType}`,
    type: `image/${fileType}`,
  };
};
