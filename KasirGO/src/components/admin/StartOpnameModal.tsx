import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { X, Search, Package } from "lucide-react-native";
import { useProducts } from "../../hooks/useProducts";
import { createStockOpname } from "../../api/opname";

interface StartOpnameModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function StartOpnameModal({
    visible,
    onClose,
    onSuccess,
}: StartOpnameModalProps) {
    const { colors } = useTheme();
    const { products, loading: productsLoading } = useProducts();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [actualQty, setActualQty] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const filteredProducts = products.filter((product) => {
        const query = searchQuery.toLowerCase();
        return (
            product.product_name.toLowerCase().includes(query) ||
            product.product_sku?.toLowerCase().includes(query)
        );
    });

    const selectedProduct = products.find((p) => p.product_id === selectedProductId);

    const handleSelectProduct = (productId: number) => {
        setSelectedProductId(productId);
        setSearchQuery("");
    };

    const handleSubmit = async () => {
        if (!selectedProductId) {
            Alert.alert("Error", "Pilih produk terlebih dahulu");
            return;
        }

        if (!actualQty || actualQty.trim() === "") {
            Alert.alert("Error", "Masukkan jumlah aktual");
            return;
        }

        const qty = parseInt(actualQty);
        if (isNaN(qty) || qty < 0) {
            Alert.alert("Error", "Jumlah aktual harus berupa angka positif");
            return;
        }

        try {
            setSubmitting(true);

            const res = await createStockOpname({
                product_id: selectedProductId,
                actual_qty: qty,
                notes: notes.trim() || undefined,
            });

            if (res.success) {
                setSelectedProductId(null);
                setActualQty("");
                setNotes("");
                setSearchQuery("");
                onSuccess();
                onClose();
            } else {
                Alert.alert("Error", res.message || "Gagal membuat opname");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Terjadi kesalahan");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Buat Stock Opname
                        </Text>
                        <TouchableOpacity onPress={onClose} disabled={submitting}>
                            <X size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Pilih Produk
                            </Text>

                            {!selectedProduct ? (
                                <>
                                    <View
                                        style={[
                                            styles.searchBar,
                                            { backgroundColor: colors.background },
                                        ]}
                                    >
                                        <Search size={18} color={colors.textSecondary} />
                                        <TextInput
                                            style={[styles.searchInput, { color: colors.text }]}
                                            placeholder="Cari produk..."
                                            placeholderTextColor={colors.textSecondary}
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                        />
                                    </View>

                                    {searchQuery.length > 0 && (
                                        <View
                                            style={[
                                                styles.productList,
                                                { backgroundColor: colors.background },
                                            ]}
                                        >
                                            {productsLoading ? (
                                                <View style={styles.loadingContainer}>
                                                    <ActivityIndicator size="small" color={colors.primary} />
                                                </View>
                                            ) : filteredProducts.length === 0 ? (
                                                <View style={styles.emptyContainer}>
                                                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                                        Produk tidak ditemukan
                                                    </Text>
                                                </View>
                                            ) : (
                                                <ScrollView style={styles.productScroll} nestedScrollEnabled>
                                                    {filteredProducts.map((product) => (
                                                        <TouchableOpacity
                                                            key={product.product_id}
                                                            style={styles.productItem}
                                                            onPress={() => handleSelectProduct(product.product_id)}
                                                        >
                                                            <View style={[styles.productIcon, { backgroundColor: colors.primary + "20" }]}>
                                                                <Package size={16} color={colors.primary} />
                                                            </View>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={[styles.productName, { color: colors.text }]}>
                                                                    {product.product_name}
                                                                </Text>
                                                                <Text style={[styles.productSku, { color: colors.textSecondary }]}>
                                                                    Stock: {product.product_qty} • SKU: {product.product_sku || '-'}
                                                                </Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            )}
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View
                                    style={[
                                        styles.selectedProduct,
                                        { backgroundColor: colors.background },
                                    ]}
                                >
                                    <View style={styles.selectedProductInfo}>
                                        <View style={[styles.productIcon, { backgroundColor: colors.primary + "20" }]}>
                                            <Package size={20} color={colors.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.productName, { color: colors.text }]}>
                                                {selectedProduct.product_name}
                                            </Text>
                                            <Text style={[styles.productSku, { color: colors.textSecondary }]}>
                                                Stock Sistem: {selectedProduct.product_qty}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setSelectedProductId(null)}>
                                            <X size={20} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>

                        {selectedProduct && (
                            <>
                                <View style={styles.section}>
                                    <Text style={[styles.label, { color: colors.text }]}>
                                        Jumlah Aktual *
                                    </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            { backgroundColor: colors.background, color: colors.text },
                                        ]}
                                        placeholder="Masukkan jumlah fisik"
                                        placeholderTextColor={colors.textSecondary}
                                        keyboardType="numeric"
                                        value={actualQty}
                                        onChangeText={setActualQty}
                                    />
                                    <Text style={[styles.hint, { color: colors.textSecondary }]}>
                                        Current system stock: {selectedProduct.product_qty}
                                    </Text>
                                </View>

                                <View style={styles.section}>
                                    <Text style={[styles.label, { color: colors.text }]}>
                                        Catatan (Opsional)
                                    </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            styles.textArea,
                                            { backgroundColor: colors.background, color: colors.text },
                                        ]}
                                        placeholder="Tambahkan catatan..."
                                        placeholderTextColor={colors.textSecondary}
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                        value={notes}
                                        onChangeText={setNotes}
                                    />
                                </View>
                            </>
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.cancelButton,
                                { backgroundColor: colors.background },
                            ]}
                            onPress={onClose}
                            disabled={submitting}
                        >
                            <Text style={[styles.buttonText, { color: colors.text }]}>
                                Batal
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.submitButton,
                                {
                                    backgroundColor: colors.primary,
                                    opacity: !selectedProductId || !actualQty || submitting ? 0.5 : 1
                                },
                            ]}
                            onPress={handleSubmit}
                            disabled={!selectedProductId || !actualQty || submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Buat Opname</Text>
                            )}
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
        maxHeight: "90%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.1)",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        borderRadius: 12,
        height: 48,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    productList: {
        marginTop: 8,
        borderRadius: 12,
        maxHeight: 200,
    },
    productScroll: {
        maxHeight: 200,
    },
    loadingContainer: {
        padding: 20,
        alignItems: "center",
    },
    emptyContainer: {
        padding: 20,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 13,
    },
    productItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.05)",
    },
    productIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    productName: {
        fontSize: 14,
        fontWeight: "600",
    },
    productSku: {
        fontSize: 12,
        marginTop: 2,
    },
    selectedProduct: {
        borderRadius: 12,
        padding: 12,
    },
    selectedProductInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    input: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        fontSize: 14,
    },
    textArea: {
        minHeight: 80,
        paddingTop: 12,
    },
    hint: {
        fontSize: 12,
        marginTop: 6,
    },
    footer: {
        flexDirection: "row",
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(0, 0, 0, 0.1)",
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {},
    submitButton: {},
    buttonText: {
        fontSize: 14,
        fontWeight: "600",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});
