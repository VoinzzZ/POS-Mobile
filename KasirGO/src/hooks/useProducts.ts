import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    Product,
    CreateProductData,
    ApiResponse,
} from '../api/product';
import {
    getCachedProducts,
    setCachedProducts,
    invalidateProductCache,
    invalidateAllProductCache,
} from '../utils/ProductCache';
import { searchProducts, filterProducts, sortProducts } from '../utils/product.helpers';
import { DEBOUNCE_DELAY } from '../constants/product.constants';

interface UseProductsOptions {
    autoLoad?: boolean;
    cacheEnabled?: boolean;
    search?: string;
    categoryId?: number;
    brandId?: number;
}

interface UseProductsReturn {
    products: Product[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    loadProducts: () => Promise<void>;
    refreshProducts: () => Promise<void>;
    createNewProduct: (data: CreateProductData) => Promise<Product | null>;
    updateExistingProduct: (id: number, data: Partial<CreateProductData>) => Promise<Product | null>;
    deleteExistingProduct: (id: number) => Promise<boolean>;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filteredProducts: Product[];
    clearError: () => void;
    retry: () => Promise<void>;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
    const {
        autoLoad = true,
        cacheEnabled = true,
        search: initialSearch = '',
        categoryId,
        brandId,
    } = options;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState<string>(initialSearch);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef<boolean>(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, DEBOUNCE_DELAY.SEARCH);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const cacheKey = { search: debouncedSearch, categoryId, brandId };

            if (cacheEnabled) {
                const cached = getCachedProducts(cacheKey);
                if (cached) {
                    if (isMountedRef.current) {
                        setProducts(cached);
                        setLoading(false);
                    }
                    return;
                }
            }

            const response = await getAllProducts(debouncedSearch, categoryId, brandId);

            if (response.success && response.data) {
                if (cacheEnabled) {
                    setCachedProducts(cacheKey, response.data);
                }
                if (isMountedRef.current) {
                    setProducts(response.data);
                }
            } else {
                throw new Error(response.message || 'Failed to load products');
            }
        } catch (err: any) {
            if (isMountedRef.current) {
                setError(err.message || 'An error occurred while loading products');
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [debouncedSearch, categoryId, brandId, cacheEnabled]);

    const refreshProducts = useCallback(async () => {
        try {
            setRefreshing(true);
            setError(null);
            invalidateAllProductCache();
            await loadProducts();
        } catch (err: any) {
            if (isMountedRef.current) {
                setError(err.message || 'An error occurred while refreshing products');
            }
        } finally {
            if (isMountedRef.current) {
                setRefreshing(false);
            }
        }
    }, [loadProducts]);

    const createNewProduct = useCallback(
        async (data: CreateProductData): Promise<Product | null> => {
            try {
                setError(null);
                const response = await createProduct(data);

                if (response.success && response.data) {
                    const newProduct = response.data;

                    if (isMountedRef.current) {
                        setProducts((prev) => [newProduct, ...prev]);
                    }

                    invalidateAllProductCache();
                    return newProduct;
                } else {
                    throw new Error(response.message || 'Failed to create product');
                }
            } catch (err: any) {
                if (isMountedRef.current) {
                    setError(err.message || 'An error occurred while creating product');
                }
                return null;
            }
        },
        []
    );

    const updateExistingProduct = useCallback(
        async (id: number, data: Partial<CreateProductData>): Promise<Product | null> => {
            try {
                setError(null);

                if (isMountedRef.current) {
                    setProducts((prev) =>
                        prev.map((p) => (p.product_id === id ? { ...p, ...data } : p))
                    );
                }

                const response = await updateProduct(id, data);

                if (response.success && response.data) {
                    const updatedProduct = response.data;

                    if (isMountedRef.current) {
                        setProducts((prev) =>
                            prev.map((p) => (p.product_id === id ? updatedProduct : p))
                        );
                    }

                    invalidateProductCache(id);
                    return updatedProduct;
                } else {
                    throw new Error(response.message || 'Failed to update product');
                }
            } catch (err: any) {
                await loadProducts();
                if (isMountedRef.current) {
                    setError(err.message || 'An error occurred while updating product');
                }
                return null;
            }
        },
        [loadProducts]
    );

    const deleteExistingProduct = useCallback(
        async (id: number): Promise<boolean> => {
            try {
                setError(null);

                const response = await deleteProduct(id);

                if (response.success) {
                    if (isMountedRef.current) {
                        setProducts((prev) => prev.filter((p) => p.product_id !== id));
                    }
                    invalidateAllProductCache();
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to delete product');
                }
            } catch (err: any) {
                const errorMessage = err.message || 'An error occurred while deleting product';
                throw new Error(errorMessage);
            }
        },
        []
    );

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const retry = useCallback(async () => {
        await refreshProducts();
    }, [refreshProducts]);

    const filteredProducts = useCallback(() => {
        let result = products;

        if (searchQuery && searchQuery !== debouncedSearch) {
            result = searchProducts(result, searchQuery);
        }

        if (categoryId) {
            result = filterProducts(result, { categoryId });
        }

        if (brandId) {
            result = filterProducts(result, { brandId });
        }

        return result;
    }, [products, searchQuery, debouncedSearch, categoryId, brandId])();

    useEffect(() => {
        if (autoLoad) {
            loadProducts();
        }
    }, [autoLoad, loadProducts]);

    return {
        products,
        loading,
        refreshing,
        error,
        loadProducts,
        refreshProducts,
        createNewProduct,
        updateExistingProduct,
        deleteExistingProduct,
        searchQuery,
        setSearchQuery,
        filteredProducts,
        clearError,
        retry,
    };
};

export default useProducts;
