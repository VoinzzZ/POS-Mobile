import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from "react-native";
import { X, User, Mail, Phone, UserCircle2 } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
    const { colors } = useTheme();
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        if (visible && user) {
            setFormData({
                fullName: user.user_full_name || user.user_name || "",
                username: user.user_name || "",
                email: user.user_email || "",
                phone: user.user_phone || "",
            });
            setErrors({});
        }
    }, [visible, user]);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Nama lengkap wajib diisi";
        }

        if (!formData.username.trim()) {
            newErrors.username = "Nama pengguna wajib diisi";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email wajib diisi";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Format email tidak valid";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await updateProfile({
                name: formData.fullName,
                phone: formData.phone,
            });

            Alert.alert("Berhasil", "Profil berhasil diperbarui", [
                {
                    text: "OK",
                    onPress: () => {
                        onClose();
                    },
                },
            ]);
        } catch (error: any) {
            Alert.alert("Gagal", error.message || "Gagal memperbarui profil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profil</Text>
                        <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.card }]}>
                            <X size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Nama Lengkap</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: errors.fullName ? colors.error : colors.border }]}>
                                <UserCircle2 size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Masukkan nama lengkap"
                                    placeholderTextColor={colors.textSecondary}
                                    value={formData.fullName}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, fullName: text });
                                        if (errors.fullName) {
                                            setErrors({ ...errors, fullName: "" });
                                        }
                                    }}
                                />
                            </View>
                            {errors.fullName && <Text style={[styles.errorText, { color: colors.error }]}>{errors.fullName}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Nama Pengguna</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: errors.username ? colors.error : colors.border }]}>
                                <User size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Masukkan nama pengguna"
                                    placeholderTextColor={colors.textSecondary}
                                    value={formData.username}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, username: text });
                                        if (errors.username) {
                                            setErrors({ ...errors, username: "" });
                                        }
                                    }}
                                />
                            </View>
                            {errors.username && <Text style={[styles.errorText, { color: colors.error }]}>{errors.username}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.6 }]}>
                                <Mail size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Masukkan email"
                                    placeholderTextColor={colors.textSecondary}
                                    value={formData.email}
                                    editable={false}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            <Text style={[styles.helperText, { color: colors.textSecondary }]}>Email tidak dapat diubah</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Nomor Telepon</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Phone size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Masukkan nomor telepon"
                                    placeholderTextColor={colors.textSecondary}
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onClose} disabled={loading}>
                                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Batal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]} onPress={handleSave} disabled={loading}>
                                {loading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Simpan</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "90%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
        marginBottom: 20,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
});
