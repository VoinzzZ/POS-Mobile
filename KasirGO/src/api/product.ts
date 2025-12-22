import api from "./axiosInstance";
import { transformProducts, transformCategories, transformBrands, transformStore } from "../utils/dataTransform";

export interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
  product_qty: number;
  product_image_url: string | null;
  product_brand_id: number | null;
  m_brand?: {
    brand_id: number;
    brand_name: string;
    brand_category_id: number | null;
    m_category?: {
      category_id: number;
      category_name: string;
    } | null;
  } | null;
  product_created_at: string;
  product_updated_at: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  category_created_at: string;
  category_updated_at: string;
}

export interface Brand {
  brand_id: number;
  brand_name: string;
  brand_category_id: number | null;
  m_category?: {
    category_id: number;
    category_name: string;
  } | null;
  brand_created_at: string;
  brand_updated_at: string;
}

export interface CreateProductData {
  product_name: string;
  product_price: number;
  product_qty: number;
  product_image_url?: string | null;
  product_brand_id?: number | null;
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
 * @param category_id - Filter by category ID
 * @param brand_id - Filter by brand ID
 */
export const getAllProducts = async (
  search?: string,
  category_id?: number,
  brand_id?: number
): Promise<ApiResponse<Product[]>> => {
  const params: any = {};
  if (search) params.search = search;
  if (category_id) params.category_id = category_id;
  if (brand_id) params.brand_id = brand_id;

  const res = await api.get("/products", { params });

  // Transform the server data to add camelCase aliases
  if (res.data.success && res.data.data) {
    const transformedData = {
      ...res.data,
      data: transformProducts(res.data.data)
    };
    return transformedData;
  }

  return res.data;
};

/**
 * Get product by ID
 * @param id - Product ID
 */
export const getProductById = async (
  id: number
): Promise<ApiResponse<Product>> => {
  const res = await api.get(`/products/${id}`);
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
    formData.append('product_name', data.product_name);
    formData.append('product_price', data.product_price.toString());
    formData.append('product_qty', data.product_qty.toString());
    if (data.product_brand_id) formData.append('brand_id', data.product_brand_id.toString());
    formData.append('image', data.image);
    
    const res = await api.post("/products", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
  
  // Otherwise, use regular JSON with field transformation
  const transformedData = {
    product_name: data.product_name,
    product_price: data.product_price,
    product_qty: data.product_qty,
    brand_id: data.product_brand_id || null,
    category_id: data.product_category_id || null
  };

  const res = await api.post("/products", transformedData);
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
    if (data.product_name) formData.append('product_name', data.product_name);
    if (data.product_price) formData.append('product_price', data.product_price.toString());
    if (data.product_qty) formData.append('product_qty', data.product_qty.toString());
    if (data.product_brand_id) formData.append('brand_id', data.product_brand_id.toString());
    formData.append('image', data.image);
    
    const res = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
  
  // Otherwise, use regular JSON
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

/**
 * Delete product
 * @param id - Product ID
 */
export const deleteProduct = async (
  id: number
): Promise<ApiResponse> => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

/**
 * Get all categories
 */
export const getAllCategories = async (): Promise<ApiResponse<Category[]>> => {
  const res = await api.get("/categories");

  // Transform the server data to add camelCase aliases
  if (res.data.success && res.data.data) {
    const transformedData = {
      ...res.data,
      data: transformCategories(res.data.data)
    };
    return transformedData;
  }

  return res.data;
};

/**
 * Get all brands
 */
export const getAllBrands = async (): Promise<ApiResponse<Brand[]>> => {
  const res = await api.get("/brands");

  // Transform the server data to add camelCase aliases
  if (res.data.success && res.data.data) {
    const transformedData = {
      ...res.data,
      data: transformBrands(res.data.data)
    };
    return transformedData;
  }

  return res.data;
};

/**
 * Create new category
 * @param name - Category name
 */
export const createCategory = async (
  name: string
): Promise<ApiResponse<Category>> => {
  const res = await api.post("/categories", { category_name: name });
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
  const res = await api.put(`/categories/${id}`, { category_name: name });
  return res.data;
};

/**
 * Delete category
 * @param id - Category ID
 */
export const deleteCategory = async (
  id: number
): Promise<ApiResponse> => {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
};

/**
 * Create new brand
 * @param name - Brand name
 * @param category_id - Optional category ID
 */
export const createBrand = async (
  name: string,
  category_id?: number | null
): Promise<ApiResponse<Brand>> => {
  const res = await api.post("/brands", { brand_name: name, brand_category_id: category_id });
  return res.data;
};

/**
 * Update brand
 * @param id - Brand ID
 * @param name - New brand name
 * @param category_id - Optional category ID
 */
export const updateBrand = async (
  id: number,
  name: string,
  category_id?: number | null
): Promise<ApiResponse<Brand>> => {
  const res = await api.put(`/brands/${id}`, { brand_name: name, brand_category_id: category_id });
  return res.data;
};

/**
 * Delete brand
 * @param id - Brand ID
 */
export const deleteBrand = async (
  id: number
): Promise<ApiResponse> => {
  const res = await api.delete(`/brands/${id}`);
  return res.data;
};

/**
 * Get products by category ID
 * @param category_id - Category ID to filter by
 */
export const getProductsByCategory = async (
  category_id: number
): Promise<ApiResponse<Product[]>> => {
  return getAllProducts(undefined, category_id);
};

/**
 * Get products by brand ID
 * @param brand_id - Brand ID to filter by
 */
export const getProductsByBrand = async (
  brand_id: number
): Promise<ApiResponse<Product[]>> => {
  return getAllProducts(undefined, undefined, brand_id);
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