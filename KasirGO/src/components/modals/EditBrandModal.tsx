import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { X, ChevronDown } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { updateBrand, Brand, getAllCategories, Category } from "../../api/product";

interface EditBrandModalProps {
  visible: boolean;
  brand: Brand | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditBrandModal: React.FC<EditBrandModalProps> = ({
  visible,
  brand,
  onClose,
  onSuccess,
}) => {
  const { colors } = useTheme();
  
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  useEffect(() => {
    if (brand) {
      setName(brand.name);
      setCategoryId(brand.categoryId || null);
    }
  }, [brand]);

  const loadCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleSubmit = async () => {
    if (!brand) return;

    // Validation
    if (!name.trim()) {
      setError("Nama brand tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      const response = await updateBrand(brand.id, name.trim(), categoryId);

      if (response.success) {
        Alert.alert("Berhasil!", "Brand berhasil diupdate", [
          {
            text: "OK",
            onPress: () => {
              setError("");
              onSuccess();
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.message || "Gagal mengupdate brand");
      }
    } catch (error: any) {
      console.error("Error updating brand:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan saat mengupdate brand"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setShowCategoryPicker(false);
    onClose();
  };

  const getSelectedCategoryName = () => {
    if (!categoryId) return "Pilih Kategori (Opsional)";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Pilih Kategori (Opsional)";
  };

  if (!brand) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit Brand
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.modalBody}>
            <Text style={[styles.label, { color: colors.text }]}>
              Nama Brand *
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: error ? "#ef4444" : colors.border, color: colors.text },
              ]}
              placeholder="Contoh: Coca-Cola, Indomie, ABC"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError("");
              }}
              autoFocus
            />
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>
              Kategori
            </Text>
            <TouchableOpacity
              style={[
                styles.picker,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={[styles.pickerText, { color: categoryId ? colors.text : colors.textSecondary }]}>
                {getSelectedCategoryName()}
              </Text>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {showCategoryPicker && (
              <View style={[styles.pickerDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => {
                    setCategoryId(null);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, { color: colors.textSecondary }]}>
                    Tanpa Kategori
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.pickerItem,
                      categoryId === category.id && { backgroundColor: colors.primary + "20" },
                    ]}
                    onPress={() => {
                      setCategoryId(category.id);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, { color: colors.text }]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
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
                loading && { opacity: 0.7 },
              ]}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.submitButtonText}>Menyimpan...</Text>
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
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 20,
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
  picker: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerText: {
    fontSize: 14,
  },
  pickerDropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  pickerItemText: {
    fontSize: 14,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: "row",
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

export default EditBrandModal;
