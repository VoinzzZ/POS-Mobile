
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
    brandId: serverData.brand_id || serverData.product_brand_id,
    categoryId: serverData.category_id || serverData.product_category_id,
    createdAt: serverData.product_created_at,
    updatedAt: serverData.product_updated_at,
    product_id: serverData.product_id,
    product_name: serverData.product_name,
    product_description: serverData.product_description,
    product_sku: serverData.product_sku,
    product_price: serverData.product_price,
    product_cost: serverData.product_cost,
    product_qty: serverData.product_qty,
    product_min_stock: serverData.product_min_stock,
    product_image_url: serverData.product_image_url,
    product_brand_id: serverData.brand_id || serverData.product_brand_id,
    product_category_id: serverData.category_id || serverData.product_category_id,
    is_active: serverData.is_active,
    is_track_stock: serverData.is_track_stock,
    is_sellable: serverData.is_sellable,
    product_created_at: serverData.product_created_at,
    product_updated_at: serverData.product_updated_at,
    // Nested relationships
    m_brand: serverData.m_brand,
    m_category: serverData.m_category,
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
    brand_id: serverData.brand_id,
    brand_name: serverData.brand_name,
    brand_category_id: serverData.brand_category_id,
    brand_created_at: serverData.brand_created_at,
    brand_updated_at: serverData.brand_updated_at,
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