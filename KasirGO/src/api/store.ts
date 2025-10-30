import api from "./axiosInstance";
import { transformStore } from "../utils/dataTransform";

export interface Store {
  store_id: number;
  store_name: string;
  store_address: string | null;
  store_phone: string | null;
  store_email: string | null;
  store_logo_url: string | null;
  store_description: string | null;
  store_created_at: string;
  store_updated_at: string;

  // CamelCase aliases for frontend use
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreResponse {
  success: boolean;
  message: string;
  data: Store;
}

export interface UpdateStoreData {
  store_name?: string;
  store_address?: string | null;
  store_phone?: string | null;
  store_email?: string | null;
  store_logo_url?: string | null;
  store_description?: string | null;
}

export interface UploadLogoResponse {
  success: boolean;
  message: string;
  data: {
    logo_url: string;
    store: Store;
  };
}

// Get store settings
export const getStoreSettings = async (): Promise<StoreResponse> => {
  const response = await api.get("/store");

  // Transform the server data to add camelCase aliases
  if (response.data.success && response.data.data) {
    const transformedData = {
      ...response.data,
      data: transformStore(response.data.data)
    };
    return transformedData;
  }

  return response.data;
};

// Update store settings (admin only)
export const updateStoreSettings = async (data: UpdateStoreData): Promise<StoreResponse> => {
  const response = await api.put("/store", data);

  // Transform the server data to add camelCase aliases
  if (response.data.success && response.data.data) {
    const transformedData = {
      ...response.data,
      data: transformStore(response.data.data)
    };
    return transformedData;
  }

  return response.data;
};

// Upload store logo (admin only)
export const uploadStoreLogo = async (logoFile: any): Promise<UploadLogoResponse> => {
  const formData = new FormData();
  formData.append('logo', {
    uri: logoFile.uri,
    type: logoFile.mimeType || 'image/jpeg',
    name: logoFile.fileName || 'logo.jpg',
  } as any);
  
  const response = await api.post("/store/logo", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete store logo (admin only)
export const deleteStoreLogo = async (): Promise<StoreResponse> => {
  const response = await api.delete("/store/logo");

  // Transform the server data to add camelCase aliases
  if (response.data.success && response.data.data) {
    const transformedData = {
      ...response.data,
      data: transformStore(response.data.data)
    };
    return transformedData;
  }

  return response.data;
};