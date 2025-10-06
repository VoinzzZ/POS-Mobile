import api from "./axiosInstance";

export interface Store {
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
  name?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  description?: string | null;
}

export interface UploadLogoResponse {
  success: boolean;
  message: string;
  data: {
    logoUrl: string;
    store: Store;
  };
}

// Get store settings
export const getStoreSettings = async (): Promise<StoreResponse> => {
  const response = await api.get("/store");
  return response.data;
};

// Update store settings (admin only)
export const updateStoreSettings = async (data: UpdateStoreData): Promise<StoreResponse> => {
  const response = await api.put("/store", data);
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
  return response.data;
};
