import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { X } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { createBrand } from "../../api/product";

interface AddBrandModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBrandModal: React.FC<AddBrandModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { colors } = useTheme();
  
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      setError("Nama brand tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      const response = await createBrand(name.trim());

      if (response.success) {
        Alert.alert("Berhasil!", "Brand berhasil ditambahkan", [
          {
            text: "OK",
            onPress: () => {
              setName("");
              setError("");
              onSuccess();
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.message || "Gagal menambahkan brand");
      }
    } catch (error: any) {
      console.error("Error creating brand:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan saat menambahkan brand"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setError("");
    onClose();
  };

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
              Tambah Brand Baru
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.modalBody}>
            <Text style={[styles.label, { color: colors.text }]}>
              Nama Brand *
            </Text>
            <View
              style={[
                styles.input,
                { borderColor: error ? "#ef4444" : colors.border },
              ]}
            >
              <TextInput
                style={{ color: colors.text, flex: 1 }}
                placeholder="Contoh: Coca-Cola, Indomie, ABC"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (error) setError("");
                }}
                autoFocus
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

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

export default AddBrandModal;
