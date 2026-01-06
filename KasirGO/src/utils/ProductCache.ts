import { Product } from '../api/product';
import { CACHE_CONFIG } from '../constants/product.constants';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class ProductCacheManager {
    private cache: Map<string, CacheEntry<any>>;

    constructor() {
        this.cache = new Map();
    }

    private isExpired(entry: CacheEntry<any>): boolean {
        return Date.now() - entry.timestamp > entry.ttl;
    }

    set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.TTL.PRODUCT): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (this.isExpired(entry)) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    invalidatePattern(pattern: string): void {
        const keys = Array.from(this.cache.keys());
        keys.forEach(key => {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        });
    }

    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

const productCache = new ProductCacheManager();

export const cacheKeys = {
    product: (id: number) => `product_${id}`,
    products: (filters: any) => `products_${JSON.stringify(filters)}`,
    categories: () => 'categories',
    brands: () => 'brands',
    categoryProducts: (categoryId: number) => `category_products_${categoryId}`,
    brandProducts: (brandId: number) => `brand_products_${brandId}`,
};

export const getCachedProduct = (id: number): Product | null => {
    return productCache.get<Product>(cacheKeys.product(id));
};

export const setCachedProduct = (id: number, product: Product): void => {
    productCache.set(cacheKeys.product(id), product, CACHE_CONFIG.TTL.PRODUCT);
};

export const getCachedProducts = (filters: any): Product[] | null => {
    return productCache.get<Product[]>(cacheKeys.products(filters));
};

export const setCachedProducts = (filters: any, products: Product[]): void => {
    productCache.set(cacheKeys.products(filters), products, CACHE_CONFIG.TTL.PRODUCTS_LIST);
};

export const invalidateProductCache = (id: number): void => {
    productCache.delete(cacheKeys.product(id));
    productCache.invalidatePattern('products_');
    productCache.invalidatePattern('category_products_');
    productCache.invalidatePattern('brand_products_');
};

export const invalidateAllProductCache = (): void => {
    productCache.clear();
};

export const getCacheStats = () => {
    return productCache.getStats();
};

export default productCache;
