import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Clipboard,
  Animated,
} from "react-native";
import { X, Copy, Check, Clock } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { generatePin, getPinHistory } from "../../api/user";

interface GeneratePinModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GeneratePinModal: React.FC<GeneratePinModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState(24);
  const [copied, setCopied] = useState(false);
  const [hasActivePin, setHasActivePin] = useState(false);
  const [activePinInfo, setActivePinInfo] = useState<any>(null);

  const translateY = useRef(new Animated.Value(1000)).current; // Start from far below the screen
  const opacity = useRef(new Animated.Value(0)).current; // Start transparent

  useEffect(() => {
    if (visible) {
      // Animate in: fade in and slide up
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      // Check if there's an active pin
      checkActivePin();
    } else {
      // Animate out: fade out and slide down
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 1000,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, opacity, translateY]);

  const checkActivePin = async () => {
    setLoading(true);
    try {
      // Gunakan getPinHistory untuk mengecek apakah ada PIN aktif
      const response = await getPinHistory(1, 1, 'active');
      if (response && response.success) {
        const hasActive = response.data.pins && response.data.pins.length > 0;
        setHasActivePin(hasActive);
        if (hasActive && response.data.pins[0]) {
          setActivePinInfo(response.data.pins[0]);
        }
      } else {
        setHasActivePin(false);
      }
    } catch (error) {
      console.error("Error checking active PIN:", error);
      // Jika terjadi error, kita tetap lanjutkan proses normal
      setHasActivePin(false);
    } finally {
      setLoading(false);
    }
  };

  const expiryOptions = [
    { label: "1 Jam", value: 1 },
    { label: "6 Jam", value: 6 },
    { label: "12 Jam", value: 12 },
    { label: "24 Jam", value: 24 },
    { label: "3 Hari", value: 72 },
    { label: "7 Hari", value: 168 },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await generatePin(selectedHours);

      if (response.success) {
        setGeneratedPin(response.data.pin);
        setExpiresAt(response.data.expiresAt);

        if (onSuccess) {
          onSuccess();
        }
      } else {
        Alert.alert("Error", response.message || "Failed to generate PIN");
      }
    } catch (error: any) {
      console.error("Generate PIN error:", error);
      let errorMessage = "Failed to generate PIN";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPin = () => {
    if (generatedPin) {
      Clipboard.setString(generatedPin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 1000,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setGeneratedPin(null);  
      setExpiresAt(null);
      setSelectedHours(24);
      setCopied(false);
      onClose();
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
              opacity
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Buat PIN Pendaftaran</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {!generatedPin ? (
            hasActivePin ? (
              // Tampilkan pesan jika ada PIN aktif
              <View style={styles.content}>
                <View style={styles.warningBox}>
                  <Text style={styles.warningTitle}>⚠️ PIN Aktif Terdeteksi</Text>
                  <Text style={styles.warningText}>
                    Masih ada PIN aktif yang belum digunakan. Harap gunakan atau cabut PIN tersebut terlebih dahulu sebelum membuat PIN baru.
                  </Text>

                  {activePinInfo && (
                    <View style={styles.activePinInfo}>
                      <Text style={styles.activePinLabel}>PIN Aktif:</Text>
                      <Text style={styles.activePinCode}>{activePinInfo.code}</Text>
                      <Text style={styles.activePinExpiry}>
                        Kadaluarsa: {formatDate(activePinInfo.expiresAt)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.closeBtnSecondary}
                      onPress={handleClose}
                    >
                      <Text style={styles.closeBtnText}>Tutup</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <>
                {/* Expiry Selection */}
                <View style={styles.content}>
                  <Text style={styles.label}>Pilih Waktu Kedaluwarsa PIN</Text>
                  <View style={styles.optionsGrid}>
                    {expiryOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionCard,
                          selectedHours === option.value && styles.optionCardActive,
                        ]}
                        onPress={() => setSelectedHours(option.value)}
                      >
                        <Clock
                          size={20}
                          color={selectedHours === option.value ? "#4ECDC4" : "#64748b"}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            selectedHours === option.value && styles.optionTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      PIN ini dapat digunakan oleh kasir untuk mendaftarkan akun mereka. PIN
                      akan kedaluwarsa setelah periode waktu yang dipilih.
                    </Text>
                  </View>
                </View>

                {/* Generate Button */}
                <TouchableOpacity
                  style={[styles.generateBtn, loading && styles.generateBtnDisabled]}
                  onPress={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.generateBtnText}>Buat PIN</Text>
                  )}
                </TouchableOpacity>
              </>
            )
          ) : (
            <>
              {/* PIN Display */}
              <View style={styles.content}>
                <View style={styles.successBox}>
                  <Check size={48} color="#10b981" />
                  <Text style={styles.successText}>PIN Berhasil Dibuat!</Text>
                </View>

                <View style={styles.pinDisplay}>
                  <Text style={styles.pinLabel}>PIN Pendaftaran</Text>
                  <View style={styles.pinCodeContainer}>
                    <Text style={styles.pinCode}>{generatedPin}</Text>
                    <TouchableOpacity onPress={handleCopyPin} style={styles.copyBtn}>
                      {copied ? (
                        <Check size={20} color="#10b981" />
                      ) : (
                        <Copy size={20} color="#4ECDC4" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {copied && <Text style={styles.copiedText}>Disalin ke papan klip!</Text>}
                </View>

                <View style={styles.expiryInfo}>
                  <Clock size={16} color="#f59e0b" />
                  <Text style={styles.expiryText}>
                    Kedaluwarsa: {expiresAt ? formatDate(expiresAt) : "-"}
                  </Text>
                </View>

                <View style={styles.instructionBox}>
                  <Text style={styles.instructionTitle}>📋 Petunjuk:</Text>
                  <Text style={styles.instructionText}>
                    1. Bagikan PIN ini kepada kasir\n                    2. Mereka dapat menggunakannya saat pendaftaran\n                    3. PIN hanya bisa digunakan sekali\n                    4. Jaga kerahasiaan PIN dan jangan bagikan secara publik
                  </Text>
                </View>
              </View>

              {/* Done Button */}
              <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneBtnText}>Selesai</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any, theme: string) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end", // Align to bottom instead of center
    alignItems: "center",
    padding: 0,
  },
  modalContainer: {
    backgroundColor: theme === "dark" ? "#2D2D2D" : colors.surface,
    borderRadius: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    marginLeft: "auto",
    marginRight: "auto",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 30, // Extra padding at bottom for better spacing
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  optionCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    gap: 8,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "15",
  },
  optionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.primary,
  },
  infoBox: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  generateBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    alignItems: "center",
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  successBox: {
    alignItems: "center",
    marginBottom: 24,
  },
  successText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.success,
    marginTop: 12,
  },
  pinDisplay: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  pinLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  pinCodeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pinCode: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 4,
  },
  copyBtn: {
    padding: 8,
  },
  copiedText: {
    fontSize: 11,
    color: colors.success,
    marginTop: 8,
  },
  expiryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.warning + "20",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  expiryText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: "600",
  },
  instructionBox: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  doneBtn: {
    backgroundColor: colors.success,
    padding: 16,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    alignItems: "center",
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  warningBox: {
    backgroundColor: colors.warning + "20",
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.warning,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  activePinInfo: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  activePinLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  activePinCode: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  activePinExpiry: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  closeBtnSecondary: {
    flex: 1,
    backgroundColor: colors.border,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
});

export default GeneratePinModal;