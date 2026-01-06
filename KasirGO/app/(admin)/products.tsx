import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  useWindowDimensions,
} from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import { useAuth } from "../../src/context/AuthContext";
import { Package, Search, Settings, Plus, Edit, Trash2, Tag, Folder, MoreVertical } from "lucide-react-native";
import AdminBottomNav from "../../src/components/navigation/AdminBottomNav";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import {
  getAllCategories,
  getAllBrands,
  deleteCategory,
  deleteBrand,
  Product,
  Category,
  Brand,
} from "../../src/api/product";
import useProducts from "../../src/hooks/useProducts";
import { formatPrice, getStockStatus, getStockStatusColor, calculateProfitMargin } from "../../src/utils/product.helpers";
import { STOCK_STATUS } from "../../src/constants/product.constants";
import AddProductModal from "../../src/components/modals/AddProductModal";
import AddCategoryModal from "../../src/components/modals/AddCategoryModal";
import AddBrandModal from "../../src/components/modals/AddBrandModal";
import EditCategoryModal from "../../src/components/modals/EditCategoryModal";
import EditBrandModal from "../../src/components/modals/EditBrandModal";
import EditProductModal from "../../src/components/modals/EditProductModal";
import ProductErrorBoundary from "../../src/components/errors/ProductErrorBoundary";

type TabType = "products" | "categories" | "brands";

export default function AdminProducts() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const layout = useWindowDimensions();

  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, user]);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'products', title: 'Products' },
    { key: 'categories', title: 'Categories' },
    { key: 'brands', title: 'Brands' },
  ]);

  const {
    products,
    loading,
    refreshing,
    error,
    refreshProducts,
    deleteExistingProduct,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    clearError,
    retry,
  } = useProducts({ autoLoad: true, cacheEnabled: true });

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditBrandModal, setShowEditBrandModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [localSearchQuery, setLocalSearchQuery] = useState("");

  useEffect(() => {
    loadCategoriesAndBrands();
  }, []);

  useEffect(() => {
    handleLocalSearch(localSearchQuery);
  }, [localSearchQuery, categories, brands, index]);

  const loadCategoriesAndBrands = async () => {
    await Promise.all([loadCategories(), loadBrands()]);
  };

  const loadCategories = async () => {
    try {
      setCategoryLoading(true);
      const response = await getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data);
        setFilteredCategories(response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setCategoryLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      setBrandLoading(true);
      const response = await getAllBrands();
      if (response.success && response.data) {
        setBrands(response.data);
        setFilteredBrands(response.data);
      }
    } catch (error) {
      console.error("Error loading brands:", error);
    } finally {
      setBrandLoading(false);
    }
  };

  const onRefresh = async () => {
    await Promise.all([refreshProducts(), loadCategoriesAndBrands()]);
  };

  const handleLocalSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();

    if (index === 1) {
      const filtered = categories.filter((c) =>
        c.category_name.toLowerCase().includes(lowerQuery)
      );
      setFilteredCategories(filtered);
    } else if (index === 2) {
      const filtered = brands.filter((b) =>
        b.brand_name.toLowerCase().includes(lowerQuery)
      );
      setFilteredBrands(filtered);
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    Alert.alert(
      "Hapus Produk",
      `Yakin ingin menghapus "${name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            const success = await deleteExistingProduct(id);
            if (success) {
              Alert.alert("Berhasil", "Produk berhasil dihapus");
            }
          },
        },
      ]
    );
  };

  const handleDeleteCategory = (id: number, name: string) => {
    Alert.alert(
      "Hapus Kategori",
      `Yakin ingin menghapus "${name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(id);
              Alert.alert("Berhasil", "Kategori berhasil dihapus. Produk terkait telah diupdate.");
              await Promise.all([loadCategories(), refreshProducts()]);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Gagal menghapus kategori");
            }
          },
        },
      ]
    );
  };

  const handleDeleteBrand = (id: number, name: string) => {
    Alert.alert(
      "Hapus Brand",
      `Yakin ingin menghapus "${name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBrand(id);
              Alert.alert("Berhasil", "Brand berhasil dihapus. Produk terkait telah diupdate.");
              await Promise.all([loadBrands(), refreshProducts()]);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Gagal menghapus brand");
            }
          },
        },
      ]
    );
  };

  const renderProductCard = (product: Product) => {
    const profitMargin = calculateProfitMargin(product);
    const stockStatus = getStockStatus(product);
    const stockColor = getStockStatusColor(stockStatus);
    const isLowStock = stockStatus === STOCK_STATUS.LOW_STOCK || stockStatus === STOCK_STATUS.OUT_OF_STOCK;

    return (
      <View
        key={product.product_id}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        {product.product_image_url ? (
          <Image source={{ uri: product.product_image_url }} style={[styles.productImageSmall, { marginRight: 12 }]} />
        ) : (
          <View style={[styles.productImagePlaceholderSmall, { backgroundColor: colors.primary + "10", marginRight: 12 }]}>
            <Package size={20} color={colors.primary} />
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {product.product_name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={[styles.cardPrice, { color: colors.primary }]}>
              {formatPrice(product.product_price)}
            </Text>
            {product.product_cost && product.product_cost > 0 && (
              <View style={[styles.badge, { backgroundColor: profitMargin > 30 ? "#10b981" : profitMargin > 15 ? "#f59e0b" : "#6b7280" }]}>
                <Text style={[styles.badgeText, { color: "#fff" }]}>
                  +{profitMargin.toFixed(0)}%
                </Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.cardStock, { color: isLowStock ? stockColor : colors.textSecondary }]}>
              Stok: {product.product_qty}
            </Text>
            {isLowStock && (
              <View style={[styles.badge, { backgroundColor: stockColor }]}>
                <Text style={[styles.badgeText, { color: "#fff" }]}>
                  {stockStatus === STOCK_STATUS.OUT_OF_STOCK ? "OUT" : "LOW"}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setSelectedProduct(product);
              setShowEditProductModal(true);
            }}
          >
            <MoreVertical size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCategoryCard = (category: Category) => {
    const productCount = products.filter(p => p.product_category_id === category.category_id).length;

    return (
      <View key={category.category_id} style={styles.categoryContainer}>
        <TouchableOpacity
          style={[styles.categoryHeader, { backgroundColor: colors.card }]}
          onPress={() => {
            router.push({
              pathname: "/productsByFilter",
              params: {
                type: "category",
                id: category.category_id.toString(),
                name: category.category_name,
              },
            });
          }}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={[styles.listIcon, { backgroundColor: colors.primary + "20" }]}>
              <Folder size={24} color={colors.primary} />
            </View>
            <View style={styles.listContent}>
              <Text style={[styles.listTitle, { color: colors.text }]}>
                {category.category_name}
              </Text>
              <Text style={[styles.listSubtitle, { color: colors.textSecondary }]}>
                {productCount} produk
              </Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn]}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedCategory(category);
                setShowEditCategoryModal(true);
              }}
            >
              <MoreVertical size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBrandCard = (brand: Brand) => {
    const productCount = products.filter(p => p.product_brand_id === brand.brand_id).length;

    return (
      <TouchableOpacity
        key={brand.brand_id}
        style={[styles.listCard, { backgroundColor: colors.card }]}
        onPress={() => {
          router.push({
            pathname: "/productsByFilter",
            params: {
              type: "brand",
              id: brand.brand_id.toString(),
              name: brand.brand_name,
            },
          });
        }}
      >
        <View style={[styles.listIcon, { backgroundColor: colors.primary + "20" }]}>
          <Tag size={24} color={colors.primary} />
        </View>
        <View style={styles.listContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.listTitle, { color: colors.text }]}>
              {brand.brand_name}
            </Text>
          </View>
          <Text style={[styles.listSubtitle, { color: colors.textSecondary }]}>
            {productCount} produk
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn]}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedBrand(brand);
              setShowEditBrandModal(true);
            }}
          >
            <MoreVertical size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderScene = ({ route }: any) => {
    const isLoading = route.key === 'products' ? loading : (route.key === 'categories' ? categoryLoading : brandLoading);
    const isRefreshing = refreshing;

    if (isLoading && !isRefreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Memuat data...
          </Text>
        </View>
      );
    }

    if (error && route.key === 'products') {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={retry}
          >
            <Text style={styles.retryBtnText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (route.key) {
      case 'products':
        return (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          >
            <View style={styles.section}>
              {filteredProducts.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                  <Package size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    {searchQuery ? "Produk tidak ditemukan" : "Belum ada produk"}
                  </Text>
                </View>
              ) : (
                filteredProducts.map(renderProductCard)
              )}
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>
        );

      case 'categories':
        return (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          >
            <View style={styles.section}>
              {filteredCategories.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                  <Folder size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    {localSearchQuery ? "Kategori tidak ditemukan" : "Belum ada kategori"}
                  </Text>
                </View>
              ) : (
                filteredCategories.map(renderCategoryCard)
              )}
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>
        );

      case 'brands':
        return (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          >
            <View style={styles.section}>
              {filteredBrands.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                  <Tag size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    {localSearchQuery ? "Brand tidak ditemukan" : "Belum ada brand"}
                  </Text>
                </View>
              ) : (
                filteredBrands.map(renderBrandCard)
              )}
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>
        );

      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: colors.primary }}
      style={{ backgroundColor: colors.background }}
      labelStyle={{ fontSize: 14, fontWeight: '600', textTransform: 'none' }}
      activeColor={colors.primary}
      inactiveColor={colors.textSecondary}
    />
  );

  const getActiveTab = (): TabType => {
    if (index === 0) return "products";
    if (index === 1) return "categories";
    return "brands";
  };

  const currentSearchQuery = index === 0 ? searchQuery : localSearchQuery;
  const setCurrentSearchQuery = index === 0 ? setSearchQuery : setLocalSearchQuery;

  return (
    <ProductErrorBoundary>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Product Management
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Kelola produk, kategori, dan brand
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(admin)/settings")}
            style={styles.settingsBtn}
          >
            <Settings size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {products.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Products
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {categories.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Categories
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {brands.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Brands
            </Text>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={`Cari ${getActiveTab()}...`}
            placeholderTextColor={colors.textSecondary}
            value={currentSearchQuery}
            onChangeText={setCurrentSearchQuery}
          />
        </View>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={renderTabBar}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
        />

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => {
            if (index === 0) setShowProductModal(true);
            else if (index === 1) setShowCategoryModal(true);
            else if (index === 2) setShowBrandModal(true);
          }}
        >
          <Plus size={28} color="#fff" />
        </TouchableOpacity>

        <AdminBottomNav />

        <AddProductModal
          visible={showProductModal}
          onClose={() => setShowProductModal(false)}
          onSuccess={refreshProducts}
        />
        <AddCategoryModal
          visible={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSuccess={loadCategories}
        />
        <AddBrandModal
          visible={showBrandModal}
          onClose={() => setShowBrandModal(false)}
          onSuccess={loadBrands}
        />
        <EditCategoryModal
          visible={showEditCategoryModal}
          category={selectedCategory}
          onClose={() => {
            setShowEditCategoryModal(false);
            setSelectedCategory(null);
          }}
          onSuccess={async () => {
            await Promise.all([loadCategories(), refreshProducts()]);
            setShowEditCategoryModal(false);
            setSelectedCategory(null);
          }}
          onDelete={handleDeleteCategory}
        />
        <EditBrandModal
          visible={showEditBrandModal}
          brand={selectedBrand}
          onClose={() => {
            setShowEditBrandModal(false);
            setSelectedBrand(null);
          }}
          onSuccess={async () => {
            await Promise.all([loadBrands(), refreshProducts()]);
            setShowEditBrandModal(false);
            setSelectedBrand(null);
          }}
          onDelete={handleDeleteBrand}
        />
        <EditProductModal
          visible={showEditProductModal}
          product={selectedProduct}
          onDelete={handleDeleteProduct}
          onClose={() => {
            setShowEditProductModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={async () => {
            await refreshProducts();
            setShowEditProductModal(false);
            setSelectedProduct(null);
          }}
        />
      </View>
    </ProductErrorBoundary>
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
  settingsBtn: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 10,
    gap: 12,
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
    fontSize: 11,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  card: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  productImageSmall: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  productImagePlaceholderSmall: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardStock: {
    fontSize: 12,
  },
  cardActions: {
    justifyContent: "center",
  },
  actionBtn: {
    padding: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  listCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  listIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 12,
  },
  emptyContainer: {
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});