import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from "react-native";
import { Store, Building2, Mail, Phone, Image as ImageIcon, FileText, Upload, Trash2 } from "lucide-react-native";
import { updateStoreSettings, uploadStoreLogo, deleteStoreLogo, UpdateStoreData, Store as StoreType, getStoreSettings } from "../../api/store";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../context/ThemeContext";

interface StoreInfoFormProps {
  store?: StoreType | null;
  onStoreUpdate?: () => void;
}

export default function StoreInfoForm({ store: externalStore, onStoreUpdate }: StoreInfoFormProps = {}) {
  const [internalStore, setInternalStore] = useState<StoreType | null>(null);
  const store = externalStore || internalStore;
  const updateStore = (newStore: StoreType) => {
    setInternalStore(newStore);
    onStoreUpdate?.();
  };
  const { colors } = useTheme();
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState<UpdateStoreData>({
    store_name: "",
    store_address: "",
    store_phone: "",
    store_email: "",
    store_logo_url: "",
    store_description: "",
  });
  
  const originalData = useRef<UpdateStoreData>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load store data
  const loadStoreData = async () => {
    if (externalStore) {
      return; // Use external store if provided
    }

    try {
      const response = await getStoreSettings();
      if (response.success && response.data) {
        setInternalStore(response.data);
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, [externalStore]);

  useEffect(() => {
    if (store) {
      const storeData = {
        store_name: store.store_name || "",
        store_address: store.store_address || "",
        store_phone: store.store_phone || "",
        store_email: store.store_email || "",
        store_logo_url: store.store_logo_url || "",
        store_description: store.store_description || "",
      };
      setFormData(storeData);
      originalData.current = { ...storeData };
      setHasChanges(false);
    }
  }, [store]);

  // Auto-save when leaving the screen
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // This runs when the screen loses focus (user navigates away)
        if (hasChanges && formData.store_name && formData.store_name.trim() !== "") {
          // Clear any pending timeout
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          // Save immediately
          autoSave();
        }
      };
    }, [hasChanges, formData])
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Check if data has changed
  const checkForChanges = (newData: UpdateStoreData) => {
    const changed = JSON.stringify(newData) !== JSON.stringify(originalData.current);
    setHasChanges(changed);
    return changed;
  };

  // Auto-save function
  const autoSave = async (dataToSave?: UpdateStoreData) => {
    const saveData = dataToSave || formData;
    
    if (!saveData.store_name || saveData.store_name.trim() === "") {
      return; // Don't save if name is empty
    }

    try {
      setSaving(true);
      const response = await updateStoreSettings(saveData);
      if (response.success) {
        originalData.current = { ...saveData };
        setHasChanges(false);
        console.log("✅ Data toko berhasil disimpan otomatis");
        updateStore(response.data); // Update internal store state
        onStoreUpdate?.(); // Notify parent component
      }
    } catch (error: any) {
      console.error("Error auto-saving store data:", error);
      // Don't show alert for auto-save errors to avoid interrupting user
    } finally {
      setSaving(false);
    }
  };

  // Debounced save function
  const debouncedSave = (newData: UpdateStoreData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (checkForChanges(newData)) {
        autoSave(newData);
      }
    }, 1500); // Save after 1.5 seconds of no changes
  };

  // Update form data and trigger auto-save
  const updateFormData = (updates: Partial<UpdateStoreData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    checkForChanges(newData);
    debouncedSave(newData);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Izin akses galeri diperlukan untuk upload logo');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets?.[0]) {
      const imageAsset = result.assets[0];
      try {
        setUploadingLogo(true);
        const response = await uploadStoreLogo(imageAsset);
        if (response.success) {
          // Update form data and original data
          const updatedData = { ...formData, store_logo_url: response.data.logo_url };
          setFormData(updatedData);
          originalData.current = { ...updatedData };
          setHasChanges(false);
          Alert.alert('Sukses', 'Logo berhasil diupload!');
          updateStore(response.data.store); // Update internal store state
          onStoreUpdate?.(); // Notify parent component
        }
      } catch (error: any) {
        console.error('Error uploading logo:', error);
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Gagal upload logo'
        );
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleDeleteLogo = async () => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menghapus logo?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingLogo(true);
              const response = await deleteStoreLogo();
              if (response.success) {
                // Update form data and original data
                const updatedData = { ...formData, store_logo_url: null };
                setFormData(updatedData);
                originalData.current = { ...updatedData };
                setHasChanges(false);
                Alert.alert('Sukses', 'Logo berhasil dihapus');
                updateStore(response.data); // Update internal store state
                onStoreUpdate?.(); // Notify parent component
              }
            } catch (error: any) {
              console.error('Error deleting logo:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Gagal menghapus logo'
              );
            } finally {
              setDeletingLogo(false);
            }
          },
        },
      ]
    );
  };

  if (!store) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Memuat data toko...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Building2 size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            Informasi Toko
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Data ini akan ditampilkan pada struk transaksi. Perubahan akan disimpan otomatis.
        </Text>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Nama Toko */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Nama Toko <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Store size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={formData.store_name}
                onChangeText={(text) => updateFormData({ store_name: text })}
                placeholder="Contoh: Toko Berkah"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Alamat */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Alamat</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Building2 size={20} color={colors.textSecondary} style={styles.iconTop} />
              <TextInput
                style={[styles.input, styles.textArea, { color: colors.text }]}
                value={formData.store_address || ""}
                onChangeText={(text) => updateFormData({ store_address: text })}
                placeholder="Jl. Contoh No. 123, Kota"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Telepon */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Telepon</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Phone size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={formData.store_phone || ""}
                onChangeText={(text) => updateFormData({ store_phone: text })}
                placeholder="0812-3456-7890"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Mail size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={formData.store_email || ""}
                onChangeText={(text) => updateFormData({ store_email: text })}
                placeholder="toko@example.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Logo Upload */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Logo Toko</Text>
            
            {/* Current Logo Display */}
            {formData.store_logo_url && (
              <View style={[styles.logoContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image
                  source={{ uri: formData.store_logo_url }}
                  style={styles.logoPreview}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={[styles.deleteLogoButton, { backgroundColor: '#ef4444' }]}
                  onPress={handleDeleteLogo}
                  disabled={deletingLogo}
                >
                  {deletingLogo ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Trash2 size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            )}
            
            {/* Upload Button */}
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handlePickImage}
              disabled={uploadingLogo}
            >
              {uploadingLogo ? (
                <>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.uploadButtonText, { color: colors.text }]}>Mengupload...</Text>
                </>
              ) : (
                <>
                  <Upload size={20} color={colors.primary} />
                  <Text style={[styles.uploadButtonText, { color: colors.text }]}>Pilih Logo</Text>
                </>
              )}
            </TouchableOpacity>
            
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Pilih gambar logo untuk ditampilkan di struk (max 2MB)
            </Text>
          </View>

          {/* Deskripsi */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Deskripsi / Tagline
            </Text>
            <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <FileText size={20} color={colors.textSecondary} style={styles.iconTop} />
              <TextInput
                style={[styles.input, styles.textArea, { color: colors.text }]}
                value={formData.store_description || ""}
                onChangeText={(text) => updateFormData({ store_description: text })}
                placeholder="Melayani dengan sepenuh hati"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>
        </View>

        {/* Auto-save Status */}
        {(saving || hasChanges) && (
          <View style={[styles.statusContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {saving ? (
              <>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.text }]}>Menyimpan...</Text>
              </>
            ) : hasChanges ? (
              <>
                <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={[styles.statusText, { color: colors.text }]}>Perubahan akan disimpan otomatis</Text>
              </>
            ) : null}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    margin: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  required: {
    color: "#ef4444",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  textAreaContainer: {
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  iconTop: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logoContainer: {
    position: "relative",
    alignSelf: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    marginBottom: 12,
  },
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  deleteLogoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    gap: 8,
    marginBottom: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});