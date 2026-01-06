import api from "./axiosInstance";
import { transformProducts, transformCategories, transformBrands, transformStore } from "../utils/dataTransform";

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  brandId: number | null;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
  // schema fields
  product_id: number;
  product_name: string;
  product_description: string | null;
  product_sku: string | null;
  product_price: number;
  product_cost: number | null;
  product_qty: number;
  product_min_stock: number | null;
  product_image_url: string | null;
  product_brand_id: number | null;
  product_category_id: number | null;
  is_active: boolean;
  is_track_stock: boolean;
  is_sellable: boolean;
  m_brand?: {
    brand_id: number;
    brand_name: string;
    m_category?: {
      category_id: number;
      category_name: string;
    } | null;
  } | null;
  m_category?: {
    category_id: number;
    category_name: string;
  } | null;
  product_created_at: string;
  product_updated_at: string;
}

export interface Category {
  id?: number;
  name?: string;
  category_id: number;
  category_name: string;
  category_created_at: string;
  category_updated_at: string;
}

export interface Brand {
  id?: number;
  name?: string;
  brand_id: number;
  brand_name: string;
  brand_category_id?: number | null;
  brand_created_at: string;
  brand_updated_at: string;
}

export interface CreateProductData {
  product_name: string;
  product_price: number;
  product_qty: number;
  product_cost?: number | null;
  product_sku?: string | null;
  product_description?: string | null;
  product_min_stock?: number | null;
  is_track_stock?: boolean;
  is_sellable?: boolean;
  product_image_url?: string | null;
  product_brand_id?: number | null;
  product_category_id?: number | null;
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

    if (data.product_cost !== undefined && data.product_cost !== null) {
      formData.append('product_cost', data.product_cost.toString());
    }
    if (data.product_sku !== undefined && data.product_sku !== null) {
      formData.append('product_sku', data.product_sku);
    }
    if (data.product_description !== undefined && data.product_description !== null) {
      formData.append('product_description', data.product_description);
    }
    if (data.product_min_stock !== undefined && data.product_min_stock !== null) {
      formData.append('product_min_stock', data.product_min_stock.toString());
    }
    if (data.is_track_stock !== undefined) {
      formData.append('is_track_stock', data.is_track_stock.toString());
    }
    if (data.is_sellable !== undefined) {
      formData.append('is_sellable', data.is_sellable.toString());
    }

    if (data.product_brand_id !== undefined && data.product_brand_id !== null) {
      formData.append('product_brand_id', data.product_brand_id.toString());
    }

    if (data.product_category_id !== undefined && data.product_category_id !== null) {
      formData.append('product_category_id', data.product_category_id.toString());
    }

    formData.append('image', data.image);

    const res = await api.post("/products", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  // Otherwise, use regular JSON with field transformation
  const transformedData: any = {
    product_name: data.product_name,
    product_price: data.product_price,
    product_qty: data.product_qty,
  };

  if (data.product_cost !== undefined) transformedData.product_cost = data.product_cost;
  if (data.product_sku !== undefined) transformedData.product_sku = data.product_sku;
  if (data.product_description !== undefined) transformedData.product_description = data.product_description;
  if (data.product_min_stock !== undefined) transformedData.product_min_stock = data.product_min_stock;
  if (data.is_track_stock !== undefined) transformedData.is_track_stock = data.is_track_stock;
  if (data.is_sellable !== undefined) transformedData.is_sellable = data.is_sellable;

  if (data.product_brand_id !== undefined && data.product_brand_id !== null) {
    transformedData.product_brand_id = data.product_brand_id;
  }

  if (data.product_category_id !== undefined && data.product_category_id !== null) {
    transformedData.product_category_id = data.product_category_id;
  }

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

    if (data.product_name !== undefined) {
      formData.append('product_name', data.product_name);
    }
    if (data.product_price !== undefined) {
      formData.append('product_price', data.product_price.toString());
    }
    if (data.product_qty !== undefined) {
      formData.append('product_qty', data.product_qty.toString());
    }
    if (data.product_cost !== undefined) {
      formData.append('product_cost', data.product_cost === null ? '' : data.product_cost.toString());
    }
    if (data.product_sku !== undefined) {
      formData.append('product_sku', data.product_sku === null ? '' : data.product_sku);
    }
    if (data.product_description !== undefined) {
      formData.append('product_description', data.product_description === null ? '' : data.product_description);
    }
    if (data.product_min_stock !== undefined) {
      formData.append('product_min_stock', data.product_min_stock === null ? '' : data.product_min_stock.toString());
    }
    if (data.is_track_stock !== undefined) {
      formData.append('is_track_stock', data.is_track_stock.toString());
    }
    if (data.is_sellable !== undefined) {
      formData.append('is_sellable', data.is_sellable.toString());
    }
    if (data.product_brand_id !== undefined && data.product_brand_id !== null) {
      formData.append('product_brand_id', data.product_brand_id.toString());
    }

    if (data.product_category_id !== undefined && data.product_category_id !== null) {
      formData.append('product_category_id', data.product_category_id.toString());
    }

    formData.append('image', data.image);

    const res = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  // Otherwise, use regular JSON with field transformation
  const transformedData: any = {};

  if (data.product_name !== undefined) transformedData.product_name = data.product_name;
  if (data.product_price !== undefined) transformedData.product_price = data.product_price;
  if (data.product_qty !== undefined) transformedData.product_qty = data.product_qty;
  if (data.product_cost !== undefined) transformedData.product_cost = data.product_cost;
  if (data.product_sku !== undefined) transformedData.product_sku = data.product_sku;
  if (data.product_description !== undefined) transformedData.product_description = data.product_description;
  if (data.product_min_stock !== undefined) transformedData.product_min_stock = data.product_min_stock;
  if (data.is_track_stock !== undefined) transformedData.is_track_stock = data.is_track_stock;
  if (data.is_sellable !== undefined) transformedData.is_sellable = data.is_sellable;
  if (data.product_brand_id !== undefined) transformedData.product_brand_id = data.product_brand_id;
  if (data.product_category_id !== undefined) transformedData.product_category_id = data.product_category_id;

  const res = await api.put(`/products/${id}`, transformedData);
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
  name: string
): Promise<ApiResponse<Brand>> => {
  const payload: any = { brand_name: name };
  const res = await api.post("/brands", payload);
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
  name: string
): Promise<ApiResponse<Brand>> => {
  const payload: any = { brand_name: name };
  const res = await api.put(`/brands/${id}`, payload);
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