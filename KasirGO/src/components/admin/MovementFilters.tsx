import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { X, Filter } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

interface MovementFiltersProps {
    visible: boolean;
    onClose: () => void;
    selectedType: string | null;
    selectedReference: string | null;
    onTypeChange: (type: string | null) => void;
    onReferenceChange: (reference: string | null) => void;
}

export default function MovementFilters({
    visible,
    onClose,
    selectedType,
    selectedReference,
    onTypeChange,
    onReferenceChange,
}: MovementFiltersProps) {
    const { colors } = useTheme();

    const movementTypes = [
        { value: "IN", label: "Masuk", color: "#10b981" },
        { value: "OUT", label: "Keluar", color: "#ef4444" },
        { value: "ADJUSTMENT", label: "Penyesuaian", color: "#3b82f6" },
        { value: "RETURN", label: "Retur", color: "#f59e0b" }
    ];

    const referenceTypes = [
        { value: "PURCHASE", label: "Pembelian" },
        { value: "SALE", label: "Penjualan" },
        { value: "ADJUSTMENT", label: "Penyesuaian" },
        { value: "RETURN", label: "Retur" },
        { value: "OPNAME", label: "Opname" }
    ];

    const hasFilters = selectedType !== null || selectedReference !== null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={[styles.container, { backgroundColor: colors.surface }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <View style={styles.headerLeft}>
                            <Filter size={20} color={colors.text} />
                            <Text style={[styles.title, { color: colors.text }]}>
                                Filter Pergerakan
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Tipe Pergerakan
                            </Text>
                            <View style={styles.optionsGrid}>
                                {movementTypes.map((type) => {
                                    const isSelected = selectedType === type.value;
                                    return (
                                        <TouchableOpacity
                                            key={type.value}
                                            style={[
                                                styles.option,
                                                {
                                                    backgroundColor: isSelected
                                                        ? type.color + "20"
                                                        : colors.card,
                                                    borderColor: isSelected ? type.color : colors.border,
                                                    borderWidth: isSelected ? 2 : 1
                                                }
                                            ]}
                                            onPress={() => onTypeChange(isSelected ? null : type.value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    {
                                                        color: isSelected ? type.color : colors.text,
                                                        fontWeight: isSelected ? "700" : "500"
                                                    }
                                                ]}
                                            >
                                                {type.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Jenis Referensi
                            </Text>
                            <View style={styles.optionsGrid}>
                                {referenceTypes.map((ref) => {
                                    const isSelected = selectedReference === ref.value;
                                    return (
                                        <TouchableOpacity
                                            key={ref.value}
                                            style={[
                                                styles.option,
                                                {
                                                    backgroundColor: isSelected
                                                        ? colors.primary + "20"
                                                        : colors.card,
                                                    borderColor: isSelected ? colors.primary : colors.border,
                                                    borderWidth: isSelected ? 2 : 1
                                                }
                                            ]}
                                            onPress={() => onReferenceChange(isSelected ? null : ref.value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    {
                                                        color: isSelected ? colors.primary : colors.text,
                                                        fontWeight: isSelected ? "700" : "500"
                                                    }
                                                ]}
                                            >
                                                {ref.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
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
        justifyContent: "flex-end",
    },
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "80%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
    },
    optionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    option: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        minWidth: "30%",
        alignItems: "center",
    },
    optionText: {
        fontSize: 13,
    },
});
