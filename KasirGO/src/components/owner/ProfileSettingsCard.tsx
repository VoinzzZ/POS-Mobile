import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { User, Mail, Briefcase, Edit2, Check, X } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function ProfileSettingsCard() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.user_name || "");
    const [email, setEmail] = useState(user?.user_email || "");

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert("Error", "Nama tidak boleh kosong");
            return;
        }
        if (!email.trim()) {
            Alert.alert("Error", "Email tidak boleh kosong");
            return;
        }

        Alert.alert("Berhasil", "Profil berhasil diperbarui");
        setIsEditing(false);
    };

    const handleCancel = () => {
        setName(user?.user_name || "");
        setEmail(user?.user_email || "");
        setIsEditing(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Informasi Profil</Text>
                {!isEditing && (
                    <TouchableOpacity
                        onPress={() => setIsEditing(true)}
                        style={[styles.editButton, { backgroundColor: colors.primary }]}
                    >
                        <Edit2 size={16} color="#ffffff" />
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={[styles.avatarContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
                    Klik untuk mengubah foto
                </Text>
            </View>

            <View style={styles.form}>
                <View style={styles.field}>
                    <View style={styles.fieldLabel}>
                        <User size={18} color={colors.textSecondary} />
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Nama Lengkap</Text>
                    </View>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Masukkan nama lengkap"
                            placeholderTextColor={colors.textSecondary}
                        />
                    ) : (
                        <Text style={[styles.value, { color: colors.text }]}>{name}</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <View style={styles.fieldLabel}>
                        <Mail size={18} color={colors.textSecondary} />
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                    </View>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Masukkan email"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    ) : (
                        <Text style={[styles.value, { color: colors.text }]}>{email}</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <View style={styles.fieldLabel}>
                        <Briefcase size={18} color={colors.textSecondary} />
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Role</Text>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: `${colors.primary}20` }]}>
                        <Text style={[styles.roleText, { color: colors.primary }]}>{user?.user_role}</Text>
                    </View>
                </View>
            </View>

            {isEditing && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={handleCancel}
                        style={[styles.actionButton, styles.cancelButton, { borderColor: colors.border }]}
                    >
                        <X size={18} color={colors.textSecondary} />
                        <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Batal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSave}
                        style={[styles.actionButton, styles.saveButton, { backgroundColor: colors.primary }]}
                    >
                        <Check size={18} color="#ffffff" />
                        <Text style={styles.saveButtonText}>Simpan</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    editButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
    avatarContainer: {
        alignItems: "center",
        paddingVertical: 24,
        borderRadius: 12,
        marginBottom: 24,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: "700",
        color: "#ffffff",
    },
    avatarHint: {
        fontSize: 12,
    },
    form: {
        gap: 20,
    },
    field: {
        gap: 8,
    },
    fieldLabel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
    },
    value: {
        fontSize: 16,
        paddingVertical: 12,
    },
    input: {
        fontSize: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    roleText: {
        fontSize: 14,
        fontWeight: "600",
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
    },
    cancelButton: {
        borderWidth: 1,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
    saveButton: {},
    saveButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
});
