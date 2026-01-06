import { useState, useCallback, useEffect } from 'react';
import { CreateProductData } from '../api/product';
import { PRODUCT_DEFAULTS, VALIDATION_RULES } from '../constants/product.constants';
import { validateImageFile } from '../utils/product.helpers';

interface ValidationErrors {
    [key: string]: string;
}

interface UseProductFormOptions {
    initialData?: Partial<CreateProductData>;
    onSubmit?: (data: CreateProductData) => Promise<void>;
}

interface UseProductFormReturn {
    formData: CreateProductData;
    errors: ValidationErrors;
    isValid: boolean;
    submitting: boolean;
    updateField: (field: keyof CreateProductData, value: any) => void;
    updateMultipleFields: (fields: Partial<CreateProductData>) => void;
    validateField: (field: keyof CreateProductData) => boolean;
    validateForm: () => boolean;
    handleSubmit: () => Promise<boolean>;
    resetForm: () => void;
    setImageFile: (file: any) => void;
    clearError: (field: keyof CreateProductData) => void;
}

const getInitialFormData = (initialData?: Partial<CreateProductData>): CreateProductData => ({
    product_name: initialData?.product_name || '',
    product_price: initialData?.product_price || 0,
    product_qty: initialData?.product_qty || PRODUCT_DEFAULTS.QTY,
    product_cost: initialData?.product_cost || null,
    product_sku: initialData?.product_sku || null,
    product_description: initialData?.product_description || null,
    product_min_stock: initialData?.product_min_stock || PRODUCT_DEFAULTS.MIN_STOCK,
    is_track_stock: initialData?.is_track_stock ?? PRODUCT_DEFAULTS.IS_TRACK_STOCK,
    is_sellable: initialData?.is_sellable ?? PRODUCT_DEFAULTS.IS_SELLABLE,
    product_image_url: initialData?.product_image_url || null,
    product_brand_id: initialData?.product_brand_id || null,
    product_category_id: initialData?.product_category_id || null,
});

export const useProductForm = (options: UseProductFormOptions = {}): UseProductFormReturn => {
    const { initialData, onSubmit } = options;

    const [formData, setFormData] = useState<CreateProductData>(() => getInitialFormData(initialData));
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (initialData) {
            setFormData(getInitialFormData(initialData));
        }
    }, [initialData]);

    const validateField = useCallback((field: keyof CreateProductData): boolean => {
        const value = formData[field];
        let error = '';

        switch (field) {
            case 'product_name':
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    error = 'Nama produk wajib diisi';
                } else if (typeof value === 'string' && value.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
                    error = `Nama produk maksimal ${VALIDATION_RULES.NAME.MAX_LENGTH} karakter`;
                }
                break;

            case 'product_price':
                if (typeof value !== 'number' || value <= 0) {
                    error = 'Harga produk harus lebih dari 0';
                }
                break;

            case 'product_qty':
                if (typeof value === 'number' && value < 0) {
                    error = 'Stok tidak boleh negatif';
                }
                break;

            case 'product_cost':
                if (value !== null && typeof value === 'number' && value < 0) {
                    error = 'Harga beli tidak boleh negatif';
                }
                break;

            case 'product_min_stock':
                if (value !== null && typeof value === 'number' && value < 0) {
                    error = 'Stok minimum tidak boleh negatif';
                }
                break;

            case 'product_sku':
                if (value !== null && typeof value === 'string' && value.length > VALIDATION_RULES.SKU.MAX_LENGTH) {
                    error = `SKU maksimal ${VALIDATION_RULES.SKU.MAX_LENGTH} karakter`;
                }
                break;

            case 'product_description':
                if (value !== null && typeof value === 'string' && value.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
                    error = `Deskripsi maksimal ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} karakter`;
                }
                break;
        }

        setErrors((prev) => ({
            ...prev,
            [field]: error,
        }));

        return error === '';
    }, [formData]);

    const validateForm = useCallback((): boolean => {
        const fields: Array<keyof CreateProductData> = [
            'product_name',
            'product_price',
            'product_qty',
            'product_cost',
            'product_min_stock',
            'product_sku',
            'product_description',
        ];

        const validations = fields.map((field) => validateField(field));
        return validations.every((isValid) => isValid);
    }, [validateField]);

    const updateField = useCallback((field: keyof CreateProductData, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [errors]);

    const updateMultipleFields = useCallback((fields: Partial<CreateProductData>) => {
        setFormData((prev) => ({
            ...prev,
            ...fields,
        }));
    }, []);

    const setImageFile = useCallback((file: any) => {
        if (!file) {
            updateField('image', null);
            return;
        }

        const validation = validateImageFile(file);
        if (!validation.valid) {
            setErrors((prev) => ({
                ...prev,
                image: validation.error || 'Invalid image file',
            }));
            return;
        }

        updateField('image', file);
    }, [updateField]);

    const clearError = useCallback((field: keyof CreateProductData) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const handleSubmit = useCallback(async (): Promise<boolean> => {
        if (!validateForm()) {
            return false;
        }

        if (!onSubmit) {
            return true;
        }

        try {
            setSubmitting(true);
            await onSubmit(formData);
            return true;
        } catch (error: any) {
            setErrors((prev) => ({
                ...prev,
                submit: error.message || 'An error occurred while submitting',
            }));
            return false;
        } finally {
            setSubmitting(false);
        }
    }, [validateForm, onSubmit, formData]);

    const resetForm = useCallback(() => {
        setFormData(getInitialFormData(initialData));
        setErrors({});
    }, [initialData]);

    const isValid = Object.keys(errors).length === 0 && formData.product_name.trim() !== '';

    return {
        formData,
        errors,
        isValid,
        submitting,
        updateField,
        updateMultipleFields,
        validateField,
        validateForm,
        handleSubmit,
        resetForm,
        setImageFile,
        clearError,
    };
};

export default useProductForm;
