const NodeCache = require('node-cache');

const productCache = new NodeCache({
    stdTTL: 600,
    checkperiod: 120,
    useClones: false,
});

const CACHE_KEYS = {
    PRODUCT: (productId) => `product:${productId}`,
    PRODUCTS_LIST: (tenantId, filters) => `products:${tenantId}:${JSON.stringify(filters)}`,
    CATEGORY_PRODUCTS: (categoryId, tenantId) => `category:${categoryId}:${tenantId}`,
    BRAND_PRODUCTS: (brandId, tenantId) => `brand:${brandId}:${tenantId}`,
    PRODUCT_COUNT: (tenantId) => `count:${tenantId}`,
};

const getCachedProduct = (productId) => {
    return productCache.get(CACHE_KEYS.PRODUCT(productId));
};

const setCachedProduct = (productId, data, ttl = 600) => {
    return productCache.set(CACHE_KEYS.PRODUCT(productId), data, ttl);
};

const getCachedProductsList = (tenantId, filters = {}) => {
    return productCache.get(CACHE_KEYS.PRODUCTS_LIST(tenantId, filters));
};

const setCachedProductsList = (tenantId, filters, data, ttl = 300) => {
    return productCache.set(CACHE_KEYS.PRODUCTS_LIST(tenantId, filters), data, ttl);
};

const getCachedCategoryProducts = (categoryId, tenantId) => {
    return productCache.get(CACHE_KEYS.CATEGORY_PRODUCTS(categoryId, tenantId));
};

const setCachedCategoryProducts = (categoryId, tenantId, data, ttl = 300) => {
    return productCache.set(CACHE_KEYS.CATEGORY_PRODUCTS(categoryId, tenantId), data, ttl);
};

const getCachedBrandProducts = (brandId, tenantId) => {
    return productCache.get(CACHE_KEYS.BRAND_PRODUCTS(brandId, tenantId));
};

const setCachedBrandProducts = (brandId, tenantId, data, ttl = 300) => {
    return productCache.set(CACHE_KEYS.BRAND_PRODUCTS(brandId, tenantId), data, ttl);
};

const invalidateProductCache = (productId, tenantId) => {
    const keys = productCache.keys();
    keys.forEach(key => {
        if (key.includes(`product:${productId}`) ||
            key.includes(`products:${tenantId}`) ||
            key.includes(`:${tenantId}`)) {
            productCache.del(key);
        }
    });
};

const invalidateTenantCache = (tenantId) => {
    const keys = productCache.keys();
    keys.forEach(key => {
        if (key.includes(`:${tenantId}`)) {
            productCache.del(key);
        }
    });
};

const clearAllCache = () => {
    productCache.flushAll();
};

const getCacheStats = () => {
    return productCache.getStats();
};

module.exports = {
    getCachedProduct,
    setCachedProduct,
    getCachedProductsList,
    setCachedProductsList,
    getCachedCategoryProducts,
    setCachedCategoryProducts,
    getCachedBrandProducts,
    setCachedBrandProducts,
    invalidateProductCache,
    invalidateTenantCache,
    clearAllCache,
    getCacheStats,
};
