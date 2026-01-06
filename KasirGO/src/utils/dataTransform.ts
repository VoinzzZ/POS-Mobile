/**
 * Data transformation utilities to convert between snake_case (database/BE)
 * and camelCase (frontend) formats
 */

// User Transform
export const transformUser = (serverData: any) => {
  return {
    id: serverData.user_id,
    userName: serverData.user_name,
    userEmail: serverData.user_email,
    role: serverData.user_role,
    isVerified: serverData.user_is_verified,
    createdAt: serverData.user_created_at,
    updatedAt: serverData.user_updated_at,
    // Keep original fields for API calls
    user_id: serverData.user_id,
    user_name: serverData.user_name,
    user_email: serverData.user_email,
    user_role: serverData.user_role,
    user_is_verified: serverData.user_is_verified,
    user_created_at: serverData.user_created_at,
    user_updated_at: serverData.user_updated_at,
  };
};

export const transformUsers = (serverData: any[]) => {
  return serverData.map(transformUser);
};

// Product Transform
export const transformProduct = (serverData: any) => {
  return {
    id: serverData.product_id,
    name: serverData.product_name,
    price: serverData.product_price,
    stock: serverData.product_qty,
    imageUrl: serverData.product_image_url,
    brandId: serverData.brand_id || serverData.product_brand_id, // Handle both cases
    categoryId: serverData.category_id || serverData.product_category_id,
    createdAt: serverData.product_created_at,
    updatedAt: serverData.product_updated_at,
    // Keep original fields for API calls
    product_id: serverData.product_id,
    product_name: serverData.product_name,
    product_price: serverData.product_price,
    product_qty: serverData.product_qty,
    product_image_url: serverData.product_image_url,
    product_brand_id: serverData.brand_id || serverData.product_brand_id,
    product_category_id: serverData.category_id || serverData.product_category_id,
    product_created_at: serverData.product_created_at,
    product_updated_at: serverData.product_updated_at,
    // Nested relationships
    m_brand: serverData.m_brand,
  };
};

export const transformProducts = (serverData: any[]) => {
  return serverData.map(transformProduct);
};

// Category Transform
export const transformCategory = (serverData: any) => {
  return {
    id: serverData.category_id,
    name: serverData.category_name,
    createdAt: serverData.category_created_at,
    updatedAt: serverData.category_updated_at,
    // Keep original fields for API calls
    category_id: serverData.category_id,
    category_name: serverData.category_name,
    category_created_at: serverData.category_created_at,
    category_updated_at: serverData.category_updated_at,
  };
};

export const transformCategories = (serverData: any[]) => {
  return serverData.map(transformCategory);
};

// Brand Transform
export const transformBrand = (serverData: any) => {
  return {
    id: serverData.brand_id,
    name: serverData.brand_name,
    categoryId: serverData.brand_category_id,
    createdAt: serverData.brand_created_at,
    updatedAt: serverData.brand_updated_at,
    // Keep original fields for API calls
    brand_id: serverData.brand_id,
    brand_name: serverData.brand_name,
    brand_category_id: serverData.brand_category_id,
    brand_created_at: serverData.brand_created_at,
    brand_updated_at: serverData.brand_updated_at,
    // Nested relationships
    m_category: serverData.m_category,
  };
};

export const transformBrands = (serverData: any[]) => {
  return serverData.map(transformBrand);
};

// Store Transform
export const transformStore = (serverData: any) => {
  return {
    id: serverData.store_id,
    name: serverData.store_name,
    address: serverData.store_address,
    phone: serverData.store_phone,
    email: serverData.store_email,
    logoUrl: serverData.store_logo_url,
    description: serverData.store_description,
    createdAt: serverData.store_created_at,
    updatedAt: serverData.store_updated_at,
    // Keep original fields for API calls
    store_id: serverData.store_id,
    store_name: serverData.store_name,
    store_address: serverData.store_address,
    store_phone: serverData.store_phone,
    store_email: serverData.store_email,
    store_logo_url: serverData.store_logo_url,
    store_description: serverData.store_description,
    store_created_at: serverData.store_created_at,
    store_updated_at: serverData.store_updated_at,
  };
};