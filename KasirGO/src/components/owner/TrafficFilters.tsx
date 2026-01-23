import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { X, BanknoteArrowUp, BanknoteArrowDown } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { getExpenseCategories, ExpenseCategory } from "../../api/expenseCategory";

interface TrafficFiltersProps {
    visible: boolean;
    onClose: () => void;
    selectedType: string | null;
    selectedPaymentMethod: string | null;
    selectedCategory: number | null;
    selectedPeriod: string | null;
    onTypeChange: (type: string | null) => void;
    onPaymentMethodChange: (method: string | null) => void;
    onCategoryChange: (categoryId: number | null) => void;
    onPeriodChange: (period: string | null) => void;
    onReset: () => void;
}

export default function TrafficFilters({
    visible,
    onClose,
    selectedType,
    selectedPaymentMethod,
    selectedCategory,
    selectedPeriod,
    onTypeChange,
    onPaymentMethodChange,
    onCategoryChange,
    onPeriodChange,
    onReset,
}: TrafficFiltersProps) {
    const { colors } = useTheme();
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);

    useEffect(() => {
        if (visible && selectedType === "EXPENSE") {
            loadCategories();
        }
    }, [visible, selectedType]);

    const loadCategories = async () => {
        try {
            const response = await getExpenseCategories();
            if (response.success && response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    const transactionTypes = [
        { value: null, label: "Semua" },
        { value: "INCOME", label: "Pemasukan", icon: BanknoteArrowUp, color: "#10b981" },
        { value: "EXPENSE", label: "Pengeluaran", icon: BanknoteArrowDown, color: "#ef4444" },
    ];

    const paymentMethods = [
        { value: null, label: "Semua" },
        { value: "CASH", label: "Tunai" },
        { value: "QRIS", label: "QRIS" },
        { value: "DEBIT", label: "Debit" },
    ];

    const periods = [
        { value: null, label: "Semua" },
        { value: "today", label: "Hari Ini" },
        { value: "week", label: "7 Hari" },
        { value: "month", label: "30 Hari" },
        { value: "year", label: "1 Tahun" },
    ];

    const handleApply = () => {
        onClose();
    };

    const handleReset = () => {
        onReset();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Filter Transaksi</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Tipe Transaksi
                            </Text>
                            <View style={styles.optionsGrid}>
                                {transactionTypes.map((type) => {
                                    const isSelected = selectedType === type.value;
                                    const TypeIcon = type.icon;
                                    return (
                                        <TouchableOpacity
                                            key={type.value || "all"}
                                            style={[
                                                styles.option,
                                                {
                                                    backgroundColor: isSelected
                                                        ? colors.primary + "20"
                                                        : colors.card,
                                                    borderColor: isSelected ? colors.primary : colors.border,
                                                },
                                            ]}
                                            onPress={() => onTypeChange(type.value)}
                                        >
                                            {TypeIcon && (
                                                <TypeIcon
                                                    size={20}
                                                    color={isSelected ? colors.primary : type.color || colors.textSecondary}
                                                />
                                            )}
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    {
                                                        color: isSelected ? colors.primary : colors.text,
                                                        fontWeight: isSelected ? "600" : "500",
                                                    },
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
                                Metode Pembayaran
                            </Text>
                            <View style={styles.optionsGrid}>
                                {paymentMethods.map((method) => {
                                    const isSelected = selectedPaymentMethod === method.value;
                                    return (
                                        <TouchableOpacity
                                            key={method.value || "all"}
                                            style={[
                                                styles.option,
                                                {
                                                    backgroundColor: isSelected
                                                        ? colors.primary + "20"
                                                        : colors.card,
                                                    borderColor: isSelected ? colors.primary : colors.border,
                                                },
                                            ]}
                                            onPress={() => onPaymentMethodChange(method.value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    {
                                                        color: isSelected ? colors.primary : colors.text,
                                                        fontWeight: isSelected ? "600" : "500",
                                                    },
                                                ]}
                                            >
                                                {method.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Periode Waktu
                            </Text>
                            <View style={styles.optionsGrid}>
                                {periods.map((period) => {
                                    const isSelected = selectedPeriod === period.value;
                                    return (
                                        <TouchableOpacity
                                            key={period.value || "all"}
                                            style={[
                                                styles.option,
                                                {
                                                    backgroundColor: isSelected
                                                        ? colors.primary + "20"
                                                        : colors.card,
                                                    borderColor: isSelected ? colors.primary : colors.border,
                                                },
                                            ]}
                                            onPress={() => onPeriodChange(period.value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    {
                                                        color: isSelected ? colors.primary : colors.text,
                                                        fontWeight: isSelected ? "600" : "500",
                                                    },
                                                ]}
                                            >
                                                {period.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {selectedType === "EXPENSE" && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Kategori Pengeluaran
                                </Text>
                                <View style={styles.categoryList}>
                                    <TouchableOpacity
                                        style={[
                                            styles.categoryOption,
                                            {
                                                backgroundColor: selectedCategory === null
                                                    ? colors.primary + "20"
                                                    : colors.card,
                                                borderColor: selectedCategory === null ? colors.primary : colors.border,
                                            },
                                        ]}
                                        onPress={() => onCategoryChange(null)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                {
                                                    color: selectedCategory === null ? colors.primary : colors.text,
                                                    fontWeight: selectedCategory === null ? "600" : "500",
                                                },
                                            ]}
                                        >
                                            Semua Kategori
                                        </Text>
                                    </TouchableOpacity>
                                    {categories.map((category) => {
                                        const isSelected = selectedCategory === category.category_id;
                                        return (
                                            <TouchableOpacity
                                                key={category.category_id}
                                                style={[
                                                    styles.categoryOption,
                                                    {
                                                        backgroundColor: isSelected
                                                            ? colors.primary + "20"
                                                            : colors.card,
                                                        borderColor: isSelected ? colors.primary : colors.border,
                                                    },
                                                ]}
                                                onPress={() => onCategoryChange(category.category_id)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.categoryText,
                                                        {
                                                            color: isSelected ? colors.primary : colors.text,
                                                            fontWeight: isSelected ? "600" : "500",
                                                        },
                                                    ]}
                                                >
                                                    {category.category_name}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={[styles.resetButton, { backgroundColor: colors.card }]}
                            onPress={handleReset}
                        >
                            <Text style={[styles.resetButtonText, { color: colors.text }]}>
                                Reset
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.applyButton, { backgroundColor: colors.primary }]}
                            onPress={handleApply}
                        >
                            <Text style={styles.applyButtonText}>Terapkan</Text>
                        </TouchableOpacity>
                    </View>
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
        gap: 8,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    optionText: {
        fontSize: 14,
    },
    categoryList: {
        gap: 8,
    },
    categoryOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    categoryText: {
        fontSize: 14,
    },
    footer: {
        flexDirection: "row",
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
    },
    resetButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    applyButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
});
