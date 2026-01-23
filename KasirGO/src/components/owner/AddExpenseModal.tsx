import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { X, DollarSign, FileText, Calendar, CreditCard, Tag } from "lucide-react-native";
import { createCashTransaction, PaymentMethod } from "../../api/cashTransaction";
import { getAllExpenseCategories, ExpenseCategory } from "../../api/expenseCategory";

interface AddExpenseModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddExpenseModal({ visible, onClose, onSuccess }: AddExpenseModalProps) {
    const { colors } = useTheme();
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        if (visible) {
            loadCategories();
        }
    }, [visible]);

    const loadCategories = async () => {
        setLoadingCategories(true);
        try {
            const response = await getAllExpenseCategories(true);
            if (response.success && response.data) {
                const operationalCategories = response.data.filter(cat =>
                    cat.category_code !== 'PURCHASE_INVENTORY' && cat.category_code !== 'RETURN_REFUND'
                );

                if (operationalCategories.length === 0) {
                    const { seedDefaultExpenseCategories } = await import("../../api/expenseCategory");
                    await seedDefaultExpenseCategories();
                    const reloadResponse = await getAllExpenseCategories(true);
                    if (reloadResponse.success && reloadResponse.data) {
                        const filteredReload = reloadResponse.data.filter(cat =>
                            cat.category_code !== 'PURCHASE_INVENTORY' && cat.category_code !== 'RETURN_REFUND'
                        );
                        setCategories(filteredReload);
                    }
                } else {
                    setCategories(operationalCategories);
                }
            }
        } catch (error) {
            console.error("Error loading categories:", error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleSubmit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert("Error", "Masukkan jumlah pengeluaran yang valid");
            return;
        }

        if (!description.trim()) {
            Alert.alert("Error", "Masukkan deskripsi pengeluaran");
            return;
        }

        setLoading(true);
        try {
            const response = await createCashTransaction({
                transaction_type: "EXPENSE",
                amount: parseFloat(amount),
                payment_method: "CASH",
                category_id: selectedCategory,
                description: description.trim(),
                notes: notes.trim() || undefined,
                transaction_date: new Date().toISOString()
            });

            if (response.success) {
                Alert.alert("Sukses", "Pengeluaran berhasil dicatat");
                handleClose();
                onSuccess();
            } else {
                Alert.alert("Error", response.message || "Gagal mencatat pengeluaran");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setAmount("");
        setDescription("");
        setNotes("");
        setSelectedCategory(null);
        onClose();
    };



    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Tambah Pengeluaran
                        </Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        <View style={styles.formSection}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Jumlah <Text style={{ color: '#ef4444' }}>*</Text>
                            </Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                                <DollarSign size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="0"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                            </View>
                        </View>

                        <View style={styles.formSection}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Deskripsi <Text style={{ color: '#ef4444' }}>*</Text>
                            </Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                                <FileText size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Contoh: Bayar listrik bulan Januari"
                                    placeholderTextColor={colors.textSecondary}
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>
                        </View>

                        <View style={styles.formSection}>
                            <Text style={[styles.label, { color: colors.text }]}>Catatan</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                                <FileText size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Catatan tambahan (opsional)"
                                    placeholderTextColor={colors.textSecondary}
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                />
                            </View>
                        </View>

                        <View style={styles.formSection}>
                            <Text style={[styles.label, { color: colors.text }]}>Kategori</Text>
                            {loadingCategories ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            ) : (
                                <View style={styles.categoriesGrid}>
                                    <TouchableOpacity
                                        style={[
                                            styles.categoryItem,
                                            { backgroundColor: colors.card },
                                            selectedCategory === null && {
                                                backgroundColor: colors.primary + '20',
                                                borderColor: colors.primary,
                                                borderWidth: 2
                                            }
                                        ]}
                                        onPress={() => setSelectedCategory(null)}
                                    >
                                        <Tag size={18} color={colors.textSecondary} />
                                        <Text style={[
                                            styles.categoryText,
                                            { color: selectedCategory === null ? colors.primary : colors.text }
                                        ]}>
                                            Tanpa Kategori
                                        </Text>
                                    </TouchableOpacity>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.category_id}
                                            style={[
                                                styles.categoryItem,
                                                { backgroundColor: colors.card },
                                                selectedCategory === cat.category_id && {
                                                    backgroundColor: colors.primary + '20',
                                                    borderColor: colors.primary,
                                                    borderWidth: 2
                                                }
                                            ]}
                                            onPress={() => setSelectedCategory(cat.category_id)}
                                        >
                                            <Tag size={18} color={colors.primary} />
                                            <Text style={[
                                                styles.categoryText,
                                                { color: selectedCategory === cat.category_id ? colors.primary : colors.text }
                                            ]}>
                                                {cat.category_name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: colors.card }]}
                            onPress={handleClose}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                                Batal
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: colors.primary }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Simpan</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        padding: 20,
    },
    formSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
    },
    paymentMethods: {
        flexDirection: 'row',
        gap: 10,
    },
    paymentMethod: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        gap: 8,
    },
    paymentMethodText: {
        fontSize: 13,
        fontWeight: '600',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        gap: 6,
        minWidth: '47%',
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '500',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        flex: 1,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
