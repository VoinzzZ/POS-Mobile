import { Product } from '../api/product';
import { STOCK_STATUS } from '../constants/product.constants';

export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
};

export const getStockStatus = (product: Product): string => {
    if (!product.is_track_stock) {
        return STOCK_STATUS.IN_STOCK;
    }

    if (product.product_qty === 0) {
        return STOCK_STATUS.OUT_OF_STOCK;
    }

    if (product.product_min_stock && product.product_qty <= product.product_min_stock) {
        return STOCK_STATUS.LOW_STOCK;
    }

    return STOCK_STATUS.IN_STOCK;
};

export const getStockStatusColor = (status: string): string => {
    switch (status) {
        case STOCK_STATUS.OUT_OF_STOCK:
            return '#EF4444';
        case STOCK_STATUS.LOW_STOCK:
            return '#F59E0B';
        case STOCK_STATUS.IN_STOCK:
        default:
            return '#10B981';
    }
};

export const calculateProfitMargin = (product: Product): number => {
    if (!product.product_cost || product.product_cost === 0) {
        return 0;
    }

    const profit = product.product_price - product.product_cost;
    return (profit / product.product_cost) * 100;
};

export const calculatePotentialProfit = (product: Product): number => {
    if (!product.product_cost) {
        return 0;
    }

    return (product.product_price - product.product_cost) * product.product_qty;
};

export const normalizeProduct = (product: any): Product => {
    return {
        ...product,
        id: product.product_id,
        name: product.product_name,
        price: product.product_price,
        stock: product.product_qty,
        imageUrl: product.product_image_url,
        brandId: product.product_brand_id,
        categoryId: product.product_category_id,
        createdAt: product.product_created_at || product.created_at,
        updatedAt: product.product_updated_at || product.updated_at,
    };
};

export const validateImageFile = (file: any): { valid: boolean; error?: string } => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!file) {
        return { valid: false, error: 'File tidak ditemukan' };
    }

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Format gambar harus JPEG, PNG, atau WebP' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'Ukuran gambar maksimal 5MB' };
    }

    return { valid: true };
};

export const generateSKU = (productName: string): string => {
    const cleaned = productName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 6);

    const timestamp = Date.now().toString().slice(-6);

    return `${cleaned}-${timestamp}`;
};

export const searchProducts = (products: Product[], query: string): Product[] => {
    if (!query || query.trim() === '') {
        return products;
    }

    const normalizedQuery = query.toLowerCase().trim();

    return products.filter((product) => {
        const name = product.product_name?.toLowerCase() || '';
        const sku = product.product_sku?.toLowerCase() || '';
        const description = product.product_description?.toLowerCase() || '';
        const brandName = product.m_brand?.brand_name?.toLowerCase() || '';
        const categoryName = product.m_category?.category_name?.toLowerCase() || '';

        return (
            name.includes(normalizedQuery) ||
            sku.includes(normalizedQuery) ||
            description.includes(normalizedQuery) ||
            brandName.includes(normalizedQuery) ||
            categoryName.includes(normalizedQuery)
        );
    });
};

export const sortProducts = (
    products: Product[],
    sortBy: string,
    sortOrder: 'asc' | 'desc'
): Product[] => {
    const sorted = [...products].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
            case 'product_name':
                aValue = a.product_name?.toLowerCase() || '';
                bValue = b.product_name?.toLowerCase() || '';
                break;
            case 'product_price':
                aValue = a.product_price || 0;
                bValue = b.product_price || 0;
                break;
            case 'product_qty':
                aValue = a.product_qty || 0;
                bValue = b.product_qty || 0;
                break;
            case 'created_at':
            default:
                aValue = new Date(a.product_created_at || a.createdAt).getTime();
                bValue = new Date(b.product_created_at || b.createdAt).getTime();
                break;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return sorted;
};

export const filterProducts = (
    products: Product[],
    filters: {
        categoryId?: number;
        brandId?: number;
        isActive?: boolean;
        isSellable?: boolean;
        lowStock?: boolean;
    }
): Product[] => {
    return products.filter((product) => {
        if (filters.categoryId !== undefined && product.product_category_id !== filters.categoryId) {
            return false;
        }

        if (filters.brandId !== undefined && product.product_brand_id !== filters.brandId) {
            return false;
        }

        if (filters.isActive !== undefined && product.is_active !== filters.isActive) {
            return false;
        }

        if (filters.isSellable !== undefined && product.is_sellable !== filters.isSellable) {
            return false;
        }

        if (filters.lowStock && product.is_track_stock) {
            const minStock = product.product_min_stock || 5;
            if (product.product_qty > minStock) {
                return false;
            }
        }

        return true;
    });
};
