import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Clipboard,
} from "react-native";
import { X, Copy, Check, Clock } from "lucide-react-native";
import { generatePin } from "../../api/admin";

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

  const expiryOptions = [
    { label: "1 Hour", value: 1 },
    { label: "6 Hours", value: 6 },
    { label: "12 Hours", value: 12 },
    { label: "24 Hours", value: 24 },
    { label: "3 Days", value: 72 },
    { label: "7 Days", value: 168 },
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
        Alert.alert("Error", "Failed to generate PIN");
      }
    } catch (error: any) {
      console.error("Generate PIN error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to generate PIN"
      );
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
    setGeneratedPin(null);
    setExpiresAt(null);
    setSelectedHours(24);
    setCopied(false);
    onClose();
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Generate Registration PIN</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {!generatedPin ? (
            <>
              {/* Expiry Selection */}
              <View style={styles.content}>
                <Text style={styles.label}>Select PIN Expiry Time</Text>
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
                    This PIN can be used by cashiers to register their account. The
                    PIN will expire after the selected time period.
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
                  <Text style={styles.generateBtnText}>Generate PIN</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* PIN Display */}
              <View style={styles.content}>
                <View style={styles.successBox}>
                  <Check size={48} color="#10b981" />
                  <Text style={styles.successText}>PIN Generated Successfully!</Text>
                </View>

                <View style={styles.pinDisplay}>
                  <Text style={styles.pinLabel}>Registration PIN</Text>
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
                  {copied && <Text style={styles.copiedText}>Copied to clipboard!</Text>}
                </View>

                <View style={styles.expiryInfo}>
                  <Clock size={16} color="#f59e0b" />
                  <Text style={styles.expiryText}>
                    Expires: {expiresAt ? formatDate(expiresAt) : "-"}
                  </Text>
                </View>

                <View style={styles.instructionBox}>
                  <Text style={styles.instructionTitle}>📋 Instructions:</Text>
                  <Text style={styles.instructionText}>
                    1. Share this PIN with the cashier{"\n"}
                    2. They can use it during registration{"\n"}
                    3. PIN is single-use only{"\n"}
                    4. Keep it secure and don't share publicly
                  </Text>
                </View>
              </View>

              {/* Done Button */}
              <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
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
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#334155",
    alignItems: "center",
    gap: 8,
  },
  optionCardActive: {
    borderColor: "#4ECDC4",
    backgroundColor: "#4ECDC4" + "15",
  },
  optionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  optionTextActive: {
    color: "#4ECDC4",
  },
  infoBox: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  infoText: {
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 18,
  },
  generateBtn: {
    backgroundColor: "#4ECDC4",
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
    color: "#10b981",
    marginTop: 12,
  },
  pinDisplay: {
    backgroundColor: "#0f172a",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  pinLabel: {
    fontSize: 12,
    color: "#64748b",
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
    color: "#4ECDC4",
    letterSpacing: 4,
  },
  copyBtn: {
    padding: 8,
  },
  copiedText: {
    fontSize: 11,
    color: "#10b981",
    marginTop: 8,
  },
  expiryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#78350f",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  expiryText: {
    fontSize: 12,
    color: "#fbbf24",
    fontWeight: "600",
  },
  instructionBox: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 20,
  },
  doneBtn: {
    backgroundColor: "#10b981",
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
});

export default GeneratePinModal;
