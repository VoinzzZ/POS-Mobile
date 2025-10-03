import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { X, Camera, Upload } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import {
  createProduct,
  uploadProductImage,
  getAllCategories,
  getAllBrands,
  Category,
  Brand,
} from "../../api/product";

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { colors } = useTheme();
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    stock?: string;
  }>({});

  // Load categories and brands
  useEffect(() => {
    if (visible) {
      loadCategoriesAndBrands();
    }
  }, [visible]);

  const loadCategoriesAndBrands = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        getAllCategories(),
        getAllBrands(),
      ]);
      
      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      
      if (brandsRes.success && brandsRes.data) {
        setBrands(brandsRes.data);
      }
    } catch (error) {
      console.error("Error loading categories and brands:", error);
    }
  };

  const validateInputs = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Nama produk tidak boleh kosong";
    }

    if (!price.trim()) {
      newErrors.price = "Harga tidak boleh kosong";
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = "Harga harus berupa angka positif";
    }

    if (!stock.trim()) {
      newErrors.stock = "Stok tidak boleh kosong";
    } else if (isNaN(Number(stock)) || Number(stock) < 0) {
      newErrors.stock = "Stok harus berupa angka positif atau 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Kami memerlukan izin untuk mengakses galeri foto Anda."
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Kami memerlukan izin untuk mengakses kamera Anda."
      );
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      let imageUrl: string | null = null;

      // Upload image if selected
      if (imageUri) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadProductImage(imageUri, name);
        } catch (error) {
          console.error("Error uploading image:", error);
          Alert.alert(
            "Warning",
            "Gagal upload gambar, produk akan dibuat tanpa gambar."
          );
        } finally {
          setUploadingImage(false);
        }
      }

      // Create product
      const response = await createProduct({
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        categoryId: categoryId || null,
        brandId: brandId || null,
        imageUrl: imageUrl,
      });

      if (response.success) {
        Alert.alert("Berhasil!", "Produk berhasil ditambahkan", [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              onSuccess();
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.message || "Gagal menambahkan produk");
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan saat menambahkan produk"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setStock("");
    setCategoryId(null);
    setBrandId(null);
    setImageUri(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Tambah Produk Baru
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Image Upload */}
            <View style={styles.imageSection}>
              <Text style={[styles.label, { color: colors.text }]}>
                Foto Produk (Opsional)
              </Text>
              {imageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    onPress={() => setImageUri(null)}
                    style={styles.removeImageButton}
                  >
                    <X size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageButtonsContainer}>
                  <TouchableOpacity
                    onPress={pickImage}
                    style={[
                      styles.imageButton,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Upload size={20} color="#fff" />
                    <Text style={styles.imageButtonText}>Pilih dari Galeri</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={takePhoto}
                    style={[
                      styles.imageButton,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Camera size={20} color="#fff" />
                    <Text style={styles.imageButtonText}>Ambil Foto</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Product Name */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Nama Produk *
              </Text>
              <View
                style={[
                  styles.input,
                  { borderColor: errors.name ? "#ef4444" : colors.border },
                ]}
              >
                <TextInput
                  style={{ color: colors.text, flex: 1 }}
                  placeholder="Contoh: Coca Cola 330ml"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) {
                      setErrors({ ...errors, name: undefined });
                    }
                  }}
                />
              </View>
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Price */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Harga (Rp) *
              </Text>
              <View
                style={[
                  styles.input,
                  { borderColor: errors.price ? "#ef4444" : colors.border },
                ]}
              >
                <TextInput
                  style={{ color: colors.text, flex: 1 }}
                  placeholder="Contoh: 5000"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={(text) => {
                    setPrice(text);
                    if (errors.price) {
                      setErrors({ ...errors, price: undefined });
                    }
                  }}
                />
              </View>
              {errors.price && (
                <Text style={styles.errorText}>{errors.price}</Text>
              )}
            </View>

            {/* Stock */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Stok *
              </Text>
              <View
                style={[
                  styles.input,
                  { borderColor: errors.stock ? "#ef4444" : colors.border },
                ]}
              >
                <TextInput
                  style={{ color: colors.text, flex: 1 }}
                  placeholder="Contoh: 100"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={stock}
                  onChangeText={(text) => {
                    setStock(text);
                    if (errors.stock) {
                      setErrors({ ...errors, stock: undefined });
                    }
                  }}
                />
              </View>
              {errors.stock && (
                <Text style={styles.errorText}>{errors.stock}</Text>
              )}
            </View>

            {/* Category Dropdown */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Kategori (Opsional)
              </Text>
              <View style={[styles.dropdownContainer, { borderColor: colors.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    onPress={() => setCategoryId(null)}
                    style={[
                      styles.dropdownChip,
                      !categoryId && { backgroundColor: colors.primary },
                      { borderColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownChipText,
                        { color: !categoryId ? "#fff" : colors.text },
                      ]}
                    >
                      Tidak Ada
                    </Text>
                  </TouchableOpacity>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      style={[
                        styles.dropdownChip,
                        categoryId === cat.id && { backgroundColor: colors.primary },
                        { borderColor: colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownChipText,
                          { color: categoryId === cat.id ? "#fff" : colors.text },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Brand Dropdown */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Brand (Opsional)
              </Text>
              <View style={[styles.dropdownContainer, { borderColor: colors.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    onPress={() => setBrandId(null)}
                    style={[
                      styles.dropdownChip,
                      !brandId && { backgroundColor: colors.primary },
                      { borderColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownChipText,
                        { color: !brandId ? "#fff" : colors.text },
                      ]}
                    >
                      Tidak Ada
                    </Text>
                  </TouchableOpacity>
                  {brands.map((brand) => (
                    <TouchableOpacity
                      key={brand.id}
                      onPress={() => setBrandId(brand.id)}
                      style={[
                        styles.dropdownChip,
                        brandId === brand.id && { backgroundColor: colors.primary },
                        { borderColor: colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownChipText,
                          { color: brandId === brand.id ? "#fff" : colors.text },
                        ]}
                      >
                        {brand.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.button, styles.cancelButton]}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.button,
                styles.submitButton,
                { backgroundColor: colors.primary },
                (loading || uploadingImage) && { opacity: 0.7 },
              ]}
              disabled={loading || uploadingImage}
            >
              {loading || uploadingImage ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.submitButtonText}>
                    {uploadingImage ? "Upload..." : "Menyimpan..."}
                  </Text>
                </>
              ) : (
                <Text style={styles.submitButtonText}>Simpan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageSection: {
    marginBottom: 20,
  },
  imagePreviewContainer: {
    position: "relative",
    alignItems: "center",
    marginTop: 10,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: -10,
    right: "30%",
    backgroundColor: "#ef4444",
    borderRadius: 20,
    padding: 6,
  },
  imageButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  imageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  dropdownChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  dropdownChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#334155",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#4ECDC4",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddProductModal;
