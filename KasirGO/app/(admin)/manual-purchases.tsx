import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Modal,
} from "react-native";
import { Search, Filter, Package, X } from "lucide-react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { Product, getAllProducts } from "../../src/api/product";
import { recordManualPurchase, ManualPurchaseData } from "../../src/api/manualPurchase";
import PurchaseProductCard from "../../src/components/admin/PurchaseProductCard";
import PurchaseInputModal from "../../src/components/admin/PurchaseInputModal";
import PurchaseSuccessCard from "../../src/components/admin/PurchaseSuccessCard";
import AdminBottomNav from "../../src/components/navigation/AdminBottomNav";

export default function ManualPurchasesScreen() {
    const { colors } = useTheme();

    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showInputModal, setShowInputModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [purchaseResult, setPurchaseResult] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllProducts();
            if (response.success && response.data) {
                const activeProducts = response.data.filter(p => p.is_active && p.is_track_stock);
                setProducts(activeProducts);
                setFilteredProducts(activeProducts);
            }
        } catch (error: any) {
            console.error("Error loading products:", error);
            alert(error.response?.data?.message || "Failed to load products");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadProducts();
        setRefreshing(false);
    }, [loadProducts]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredProducts(products);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = products.filter(
                (p) =>
                    p.product_name.toLowerCase().includes(query) ||
                    p.product_sku?.toLowerCase().includes(query) ||
                    p.m_category?.category_name.toLowerCase().includes(query) ||
                    p.m_brand?.brand_name.toLowerCase().includes(query)
            );
            setFilteredProducts(filtered);
        }
    }, [searchQuery, products]);

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setShowInputModal(true);
    };

    const handlePurchaseSubmit = async (data: {
        quantity: number;
        total_price: number;
        notes: string;
    }) => {
        if (!selectedProduct) return;

        try {
            setSubmitting(true);

            const purchaseData: ManualPurchaseData = {
                product_id: selectedProduct.product_id,
                quantity: data.quantity,
                total_price: data.total_price,
                notes: data.notes || undefined,
            };

            const response = await recordManualPurchase(purchaseData);

            if (response.success && response.data) {
                setPurchaseResult(response.data);
                setShowInputModal(false);
                setShowSuccessModal(true);
                await loadProducts();
            }
        } catch (error: any) {
            console.error("Error recording purchase:", error);
            alert(error.response?.data?.message || "Failed to record purchase");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseSuccess = () => {
        setShowSuccessModal(false);
        setPurchaseResult(null);
        setSelectedProduct(null);
    };

    const handleAddAnother = () => {
        setShowSuccessModal(false);
        setPurchaseResult(null);
        setSelectedProduct(null);
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <PurchaseProductCard product={item} onPress={() => handleProductSelect(item)} />
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
                <Package size={48} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {searchQuery ? "Produk tidak ditemukan" : "Belum ada produk"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {searchQuery
                    ? "Coba kata kunci lain"
                    : "Tambah produk untuk mulai mencatat pembelian"}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Catat Pembelian</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Pilih produk untuk menambah stok
                </Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
                    <Search size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Cari produk berdasarkan nama, SKU, brand..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <X size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {filteredProducts.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Produk
                    </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.statValue, { color: "#f59e0b" }]}>
                        {filteredProducts.filter(p => p.product_qty < (p.product_min_stock || 10)).length}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Stok Rendah
                    </Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.product_id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={renderEmpty}
                />
            )}

            <PurchaseInputModal
                visible={showInputModal}
                product={selectedProduct}
                onClose={() => setShowInputModal(false)}
                onSubmit={handlePurchaseSubmit}
                loading={submitting}
            />

            <Modal
                visible={showSuccessModal}
                transparent
                animationType="fade"
                onRequestClose={handleCloseSuccess}
            >
                <View style={styles.successModalOverlay}>
                    <TouchableOpacity
                        style={styles.successModalBackground}
                        activeOpacity={1}
                        onPress={handleCloseSuccess}
                    />
                    <View style={styles.successModalContent}>
                        {purchaseResult && (
                            <PurchaseSuccessCard
                                productName={purchaseResult.product.product_name}
                                quantity={purchaseResult.stock_movement.quantity}
                                oldQty={purchaseResult.product.old_qty}
                                newQty={purchaseResult.product.new_qty}
                                totalAmount={purchaseResult.product.total_amount}
                                transactionNumber={purchaseResult.cash_transaction.transaction_number}
                                onAddAnother={handleAddAnother}
                            />
                        )}
                    </View>
                </View>
            </Modal>
            <AdminBottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        borderRadius: 12,
        height: 48,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    statsRow: {
        flexDirection: "row",
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: "center",
    },
    successModalOverlay: {
        flex: 1,
    },
    successModalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    successModalContent: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -175 }, { translateY: -200 }],
        width: 350,
    },
});
