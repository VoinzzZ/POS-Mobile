export const PRODUCT_DEFAULTS = {
    MIN_STOCK: 5,
    QTY: 0,
    IS_ACTIVE: true,
    IS_TRACK_STOCK: true,
    IS_SELLABLE: true,
};

export const VALIDATION_RULES = {
    NAME: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 200,
    },
    DESCRIPTION: {
        MAX_LENGTH: 1000,
    },
    SKU: {
        MAX_LENGTH: 50,
    },
    PRICE: {
        MIN: 0,
    },
    STOCK: {
        MIN: 0,
    },
};

export const IMAGE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    DIMENSIONS: {
        MAX_WIDTH: 2000,
        MAX_HEIGHT: 2000,
    },
};

export const CACHE_CONFIG = {
    TTL: {
        PRODUCT: 600000,
        PRODUCTS_LIST: 300000,
        CATEGORIES: 600000,
        BRANDS: 600000,
    },
};

export const PAGINATION = {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
};

export const SORT_OPTIONS = {
    CREATED_AT: 'created_at',
    NAME: 'product_name',
    PRICE: 'product_price',
    STOCK: 'product_qty',
};

export const SORT_ORDER = {
    ASC: 'asc',
    DESC: 'desc',
};

export const STOCK_STATUS = {
    IN_STOCK: 'in_stock',
    LOW_STOCK: 'low_stock',
    OUT_OF_STOCK: 'out_of_stock',
};

export const DEBOUNCE_DELAY = {
    SEARCH: 500,
    INPUT: 300,
};
