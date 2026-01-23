import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    Alert,
} from "react-native";
import { X, Search, Package, CheckSquare, Square } from "lucide-react-native";
import { useTheme } from "../../../context/ThemeContext";
import {
    Product,
    getAvailableProductsForBrand,
    getAvailableProductsForCategory,
    linkProductsToBrand,
    linkProductsToCategory,
} from "../../../api/product";

interface SelectProductModalProps {
    visible: boolean;
    type: "brand" | "category";
    filterId: number;
    filterName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SelectProductModal({
    visible,
    type,
    filterId,
    filterName,
    onClose,
    onSuccess,
}: SelectProductModalProps) {
    const { colors } = useTheme();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            loadAvailableProducts();
            setSelectedIds([]);
            setSearchQuery("");
        }
    }, [visible, type, filterId]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredProducts(products);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = products.filter(
                (p) =>
                    p.product_name.toLowerCase().includes(query) ||
                    p.product_sku?.toLowerCase().includes(query)
            );
            setFilteredProducts(filtered);
        }
    }, [searchQuery, products]);

    const loadAvailableProducts = async () => {
        setLoading(true);
        try {
            let response;
            if (type === "brand") {
                response = await getAvailableProductsForBrand(filterId);
            } else {
                response = await getAvailableProductsForCategory(filterId);
            }

            if (response?.success && response.data) {
                setProducts(response.data);
                setFilteredProducts(response.data);
            } else {
                setProducts([]);
                setFilteredProducts([]);
            }
        } catch (error: any) {
            console.error("Error loading available products:", error);
            Alert.alert("Error", "Gagal memuat produk yang tersedia");
            setProducts([]);
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (productId: number) => {
        setSelectedIds((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSubmit = async () => {
        if (selectedIds.length === 0) {
            Alert.alert("Perhatian", "Pilih minimal satu produk");
            return;
        }

        setSubmitting(true);
        try {
            let response;
            if (type === "brand") {
                response = await linkProductsToBrand(filterId, selectedIds);
            } else {
                response = await linkProductsToCategory(filterId, selectedIds);
            }

            if (response?.success) {
                onSuccess();
                onClose();
            } else {
                Alert.alert("Error", response?.message || "Gagal meng-link produk");
            }
        } catch (error: any) {
            console.error("Error linking products:", error);
            Alert.alert("Error", error.message || "Gagal meng-link produk");
        } finally {
            setSubmitting(false);
        }
    };

    const renderProductItem = ({ item }: { item: Product }) => {
        const isSelected = selectedIds.includes(item.product_id);
        const currentBrand = item.m_brand?.brand_name || "Tanpa Brand";
        const currentCategory = item.m_category?.category_name || "Tanpa Kategori";

        return (
            <TouchableOpacity
                style={[
                    styles.productItem,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    isSelected && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => toggleSelection(item.product_id)}
            >
                <View style={styles.checkboxContainer}>
                    {isSelected ? (
                        <CheckSquare size={24} color={colors.primary} />
                    ) : (
                        <Square size={24} color={colors.textSecondary} />
                    )}
                </View>
                <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]}>
                        {item.product_name}
                    </Text>
                    <Text style={[styles.productDetail, { color: colors.textSecondary }]}>
                        {type === "brand" ? `Kategori: ${currentCategory}` : `Brand: ${currentBrand}`}
                    </Text>
                    {item.product_sku && (
                        <Text style={[styles.productSku, { color: colors.textSecondary }]}>
                            SKU: {item.product_sku}
                        </Text>
                    )}
                    <Text style={[styles.productPrice, { color: colors.primary }]}>
                        Rp {item.product_price.toLocaleString("id-ID")}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.surface }]}>
                    <View style={styles.headerContent}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Pilih Produk untuk {type === "brand" ? "Brand" : "Kategori"}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {filterName}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
                    <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Search size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Cari produk..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    {selectedIds.length > 0 && (
                        <Text style={[styles.selectedCount, { color: colors.primary }]}>
                            {selectedIds.length} produk dipilih
                        </Text>
                    )}
                </View>

                {/* Product List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                            Memuat produk...
                        </Text>
                    </View>
                ) : filteredProducts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Package size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>
                            Tidak ada produk yang tersedia
                        </Text>
                        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                            {searchQuery
                                ? "Tidak ada hasil untuk pencarian ini"
                                : `Semua produk sudah ter-link dengan ${type === "brand" ? "brand" : "kategori"} ini`}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredProducts}
                        keyExtractor={(item) => item.product_id.toString()}
                        renderItem={renderProductItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Footer with Submit Button */}
                <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: selectedIds.length > 0 ? colors.primary : colors.border },
                        ]}
                        onPress={handleSubmit}
                        disabled={submitting || selectedIds.length === 0}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                Simpan ({selectedIds.length})
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    closeButton: {
        padding: 4,
        marginLeft: 12,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    selectedCount: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 8,
        textAlign: "center",
    },
    listContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    productItem: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    checkboxContainer: {
        marginRight: 12,
        justifyContent: "center",
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    productDetail: {
        fontSize: 14,
        marginBottom: 2,
    },
    productSku: {
        fontSize: 12,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
        textAlign: "center",
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
        lineHeight: 20,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopWidth: 1,
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },
});
