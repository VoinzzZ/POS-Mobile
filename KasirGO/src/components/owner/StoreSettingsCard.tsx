import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Store, MapPin, Clock, Percent, DollarSign, Check, X, Edit2 } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

export default function StoreSettingsCard() {
    const { colors } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [storeName, setStoreName] = useState("Toko Serbaguna");
    const [storeAddress, setStoreAddress] = useState("Jl. Contoh No. 123, Jakarta");
    const [openTime, setOpenTime] = useState("08:00");
    const [closeTime, setCloseTime] = useState("22:00");
    const [taxRate, setTaxRate] = useState("10");

    const handleSave = () => {
        if (!storeName.trim()) {
            Alert.alert("Error", "Nama toko tidak boleh kosong");
            return;
        }

        Alert.alert("Berhasil", "Pengaturan toko berhasil diperbarui");
        setIsEditing(false);
    };

    const handleCancel = () => {
        setStoreName("Toko Serbaguna");
        setStoreAddress("Jl. Contoh No. 123, Jakarta");
        setOpenTime("08:00");
        setCloseTime("22:00");
        setTaxRate("10");
        setIsEditing(false);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Store size={24} color={colors.primary} />
                    <Text style={[styles.title, { color: colors.text }]}>Pengaturan Toko</Text>
                </View>
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

            <View style={[styles.card, { backgroundColor: colors.card }]}>
                <View style={styles.field}>
                    <View style={styles.fieldLabel}>
                        <Store size={18} color={colors.textSecondary} />
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Nama Toko</Text>
                    </View>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                            value={storeName}
                            onChangeText={setStoreName}
                            placeholder="Masukkan nama toko"
                            placeholderTextColor={colors.textSecondary}
                        />
                    ) : (
                        <Text style={[styles.value, { color: colors.text }]}>{storeName}</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <View style={styles.fieldLabel}>
                        <MapPin size={18} color={colors.textSecondary} />
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Alamat</Text>
                    </View>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                            value={storeAddress}
                            onChangeText={setStoreAddress}
                            placeholder="Masukkan alamat lengkap"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={3}
                        />
                    ) : (
                        <Text style={[styles.value, { color: colors.text }]}>{storeAddress}</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <View style={styles.fieldLabel}>
                        <Clock size={18} color={colors.textSecondary} />
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Jam Operasional</Text>
                    </View>
                    {isEditing ? (
                        <View style={styles.timeContainer}>
                            <View style={styles.timeField}>
                                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Buka</Text>
                                <TextInput
                                    style={[styles.timeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    value={openTime}
                                    onChangeText={setOpenTime}
                                    placeholder="08:00"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                            <Text style={[styles.timeSeparator, { color: colors.textSecondary }]}>-</Text>
                            <View style={styles.timeField}>
                                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Tutup</Text>
                                <TextInput
                                    style={[styles.timeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    value={closeTime}
                                    onChangeText={setCloseTime}
                                    placeholder="22:00"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                        </View>
                    ) : (
                        <Text style={[styles.value, { color: colors.text }]}>{openTime} - {closeTime}</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <View style={styles.fieldLabel}>
                        <Percent size={18} color={colors.textSecondary} />
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Pajak (%)</Text>
                    </View>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                            value={taxRate}
                            onChangeText={setTaxRate}
                            placeholder="10"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                        />
                    ) : (
                        <Text style={[styles.value, { color: colors.text }]}>{taxRate}%</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <View style={styles.fieldLabel}>
                        <DollarSign size={18} color={colors.textSecondary} />
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Mata Uang</Text>
                    </View>
                    <Text style={[styles.value, { color: colors.text }]}>Rupiah (IDR)</Text>
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

            <View style={[styles.infoCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Pengaturan ini akan mempengaruhi tampilan dan perhitungan di seluruh aplikasi.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
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
    card: {
        padding: 20,
        borderRadius: 12,
        gap: 20,
        marginBottom: 16,
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
        paddingVertical: 4,
    },
    input: {
        fontSize: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    timeField: {
        flex: 1,
        gap: 4,
    },
    timeLabel: {
        fontSize: 12,
    },
    timeInput: {
        fontSize: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        textAlign: "center",
    },
    timeSeparator: {
        fontSize: 18,
        fontWeight: "600",
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
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
    infoCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 20,
        textAlign: "center",
    },
});
