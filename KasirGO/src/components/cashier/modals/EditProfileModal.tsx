import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    ScrollView,
    Modal,
    Platform,
    StatusBar,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import SlideModal from "./SlideModal";

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    visible,
    onClose,
}) => {
    const { colors } = useTheme();
    const { user, updateProfile } = useAuth();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (visible && user) {
            setName(user.user_full_name || user.user_name || "");
            setPhone(user.user_phone || "");
        }
    }, [visible, user]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Nama tidak boleh kosong");
            return;
        }

        setLoading(true);
        try {
            await updateProfile({
                name: name.trim(),
                phone: phone.trim(),
            });
            onClose();
        } catch (error: any) {
            Alert.alert("Kesalahan", error.message || "Gagal memperbarui profil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SlideModal visible={visible} onClose={onClose} backgroundColor={colors.background}>
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Edit Profil</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Body */}
                <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Nama Lengkap *</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: error ? "#ef4444" : colors.border,
                                    color: colors.text,
                                },
                            ]}
                            placeholder="Masukkan nama lengkap"
                            placeholderTextColor={colors.textSecondary}
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (error) setError("");
                            }}
                        />
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Nomor Telepon</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.border,
                                    color: colors.text,
                                },
                            ]}
                            placeholder="Masukkan nomor telepon"
                            placeholderTextColor={colors.textSecondary}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.border,
                                    borderColor: colors.border,
                                    color: colors.textSecondary,
                                },
                            ]}
                            value={user?.user_email}
                            editable={false}
                        />
                        <Text style={[styles.hint, { color: colors.textSecondary }]}>
                            Email tidak dapat diubah di sini.
                        </Text>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={[styles.footer, { borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={[
                            styles.saveButton,
                            { backgroundColor: colors.primary },
                        ]}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.saveText}>Simpan</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SlideModal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        flex: 1,
        textAlign: "center",
    },
    backButton: {
        padding: 4,
    },
    headerSpacer: {
        width: 32,
    },
    body: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    hint: {
        fontSize: 12,
        marginTop: 6,
    },
    errorText: {
        color: "#ef4444",
        fontSize: 12,
        marginTop: 4,
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === "ios" ? 40 : 20,
        borderTopWidth: 1,
    },
    saveButton: {
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    saveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default EditProfileModal;
