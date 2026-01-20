import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, FlatList } from "react-native";
import { useAuth } from "../../src/context/AuthContext";

import CashierSidebar from "../../src/components/navigation/CashierSidebar";
import ProductCard from "../../src/components/cashier/ProductCard";
import ProductSearchBar from "../../src/components/cashier/ProductSearchBar";
import LowStockAlert from "../../src/components/cashier/LowStockAlert";
import ProductDetailModal from "../../src/components/cashier/ProductDetailModal";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { getAllProducts, Product, getAllCategories, getAllBrands, Category, Brand } from "../../src/api/product";
import { getLowStockProducts } from "../../src/api/stock";
import { useOrientation } from "../../src/hooks/useOrientation";

export default function ProductCatalog() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();

    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalVisible, setModalVisible] = useState(false);



    const fetchProducts = async () => {
        try {
            const response = await getAllProducts(
                searchQuery || undefined,
                selectedCategory || undefined,
                selectedBrand || undefined
            );

            if (response.success && response.data) {
                setProducts(response.data);
                setFilteredProducts(response.data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            Alert.alert("Error", "Gagal memuat produk");
        }
    };

    const fetchLowStockCount = async () => {
        try {
            const response = await getLowStockProducts();
            if (response.success && response.data) {
                setLowStockCount(response.data.length);
            }
        } catch (error) {
            console.error("Error fetching low stock:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            if (response.success && response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await getAllBrands();
            if (response.success && response.data) {
                setBrands(response.data);
            }
        } catch (error) {
            console.error("Error fetching brands:", error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([
            fetchProducts(),
            fetchLowStockCount(),
            fetchCategories(),
            fetchBrands()
        ]);
        setLoading(false);
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [selectedCategory, selectedBrand, searchQuery])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleProductPress = (product: Product) => {
        setSelectedProduct(product);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedProduct(null);
    };

    const { isLandscape: isLand, isTablet: isTab } = useOrientation();

    const renderContent = () => (
        <>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Product Catalog</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Browse product information</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Memuat produk...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={({ item }) => (
                        <ProductCard
                            key={item.id}
                            product={item}
                            gridView={true}
                            onPress={() => handleProductPress(item)}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={4}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListHeaderComponent={
                        <View style={{ marginBottom: 20 }}>
                            <LowStockAlert lowStockCount={lowStockCount} />
                            <ProductSearchBar
                                value={searchQuery}
                                onChangeText={handleSearch}
                                placeholder="Search products..."
                            />
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                            <Text style={[styles.emptyText, { color: colors.text }]}>Tidak ada produk</Text>
                        </View>
                    }
                    ListFooterComponent={<View style={{ height: 100 }} />}
                    contentContainerStyle={styles.section}
                />
            )}

            <ProductDetailModal
                visible={modalVisible}
                product={selectedProduct}
                onClose={handleCloseModal}
            />
        </>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.landscapeMaster}>
                <CashierSidebar />
                <View style={styles.landscapeContent}>
                    {renderContent()}
                </View>
            </View>
        </View>
    );
}

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
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    headerActions: {
        flexDirection: "row",
        gap: 12,
    },
    settingsBtn: {
        padding: 8,
    },
    logoutBtn: {
        padding: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 14,
    },
    landscapeMaster: {
        flex: 1,
        flexDirection: "row",
    },
    landscapeContent: {
        flex: 1,
        flexDirection: "column",
    },
});
