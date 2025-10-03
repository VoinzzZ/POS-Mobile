import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { Package, Search, Settings, Plus, Edit, Trash2, Tag, Folder } from "lucide-react-native";
import AdminBottomNav from "../../src/components/navigation/AdminBottomNav";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import {
  getAllProducts,
  getAllCategories,
  getAllBrands,
  deleteProduct,
  deleteCategory,
  deleteBrand,
  Product,
  Category,
  Brand,
} from "../../src/api/product";
import AddProductModal from "../../src/components/modals/AddProductModal";
import AddCategoryModal from "../../src/components/modals/AddCategoryModal";
import AddBrandModal from "../../src/components/modals/AddBrandModal";
import EditCategoryModal from "../../src/components/modals/EditCategoryModal";
import EditBrandModal from "../../src/components/modals/EditBrandModal";

type TabType = "products" | "categories" | "brands";

export default function AdminProducts() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, user]);

  const [activeTab, setActiveTab] = useState<TabType>("products");
  const [searchQuery, setSearchQuery] = useState("");

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  
  // Brands state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);

  // Loading & Modal states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditBrandModal, setShowEditBrandModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, products, categories, brands, activeTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadProducts(), loadCategories(), loadBrands()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await getAllProducts();
      if (response.success && response.data) {
        setProducts(response.data);
        setFilteredProducts(response.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data);
        setFilteredCategories(response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await getAllBrands();
      if (response.success && response.data) {
        setBrands(response.data);
        setFilteredBrands(response.data);
      }
    } catch (error) {
      console.error("Error loading brands:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, []);

  const handleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (activeTab === "products") {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.category?.name.toLowerCase().includes(lowerQuery) ||
          p.brand?.name.toLowerCase().includes(lowerQuery)
      );
      setFilteredProducts(filtered);
    } else if (activeTab === "categories") {
      const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(lowerQuery)
      );
      setFilteredCategories(filtered);
    } else if (activeTab === "brands") {
      const filtered = brands.filter((b) =>
        b.name.toLowerCase().includes(lowerQuery)
      );
      setFilteredBrands(filtered);
    }
  };

  const handleDeleteProduct = (id: number, name: string) => {
    Alert.alert(
      "Hapus Produk",
      `Yakin ingin menghapus "${name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(id);
              Alert.alert("Berhasil", "Produk berhasil dihapus");
              loadProducts();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Gagal menghapus produk");
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
              Alert.alert("Berhasil", "Kategori berhasil dihapus");
              loadCategories();
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
              Alert.alert("Berhasil", "Brand berhasil dihapus");
              loadBrands();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Gagal menghapus brand");
            }
          },
        },
      ]
    );
  };

  const renderProductCard = (product: Product) => (
    <View
      key={product.id}
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImagePlaceholder, { backgroundColor: colors.primary + "20" }]}>
          <Package size={32} color={colors.primary} />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {product.name}
        </Text>
        <Text style={[styles.cardPrice, { color: colors.primary }]}>
          Rp {product.price.toLocaleString("id-ID")}
        </Text>
        <View style={styles.cardMeta}>
          {product.category && (
            <View style={[styles.badge, { backgroundColor: "#3b82f6" + "20" }]}>
              <Text style={[styles.badgeText, { color: "#3b82f6" }]}>
                {product.category.name}
              </Text>
            </View>
          )}
          {product.brand && (
            <View style={[styles.badge, { backgroundColor: "#f59e0b" + "20" }]}>
              <Text style={[styles.badgeText, { color: "#f59e0b" }]}>
                {product.brand.name}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.cardStock, { color: product.stock < 10 ? "#ef4444" : colors.textSecondary }]}>
          Stok: {product.stock}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary + "20" }]}
          onPress={() => {
            // TODO: Implement EditProductModal
            Alert.alert("Info", "Edit product feature coming soon!");
          }}
        >
          <Edit size={16} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#ef4444" + "20" }]}
          onPress={() => handleDeleteProduct(product.id, product.name)}
        >
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryCard = (category: Category) => {
    const productCount = products.filter(p => p.categoryId === category.id).length;
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.listCard, { backgroundColor: colors.card }]}
        onPress={() => {
          // Filter products by this category
          setActiveTab("products");
          const filtered = products.filter(p => p.categoryId === category.id);
          setFilteredProducts(filtered);
          Alert.alert("Filter", `Menampilkan ${filtered.length} produk dengan kategori "${category.name}"`);
        }}
      >
        <View style={[styles.listIcon, { backgroundColor: colors.primary + "20" }]}>
          <Folder size={24} color={colors.primary} />
        </View>
        <View style={styles.listContent}>
          <Text style={[styles.listTitle, { color: colors.text }]}>
            {category.name}
          </Text>
          <Text style={[styles.listSubtitle, { color: colors.textSecondary }]}>
            {productCount} produk
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary + "20" }]}
            onPress={() => {
              setSelectedCategory(category);
              setShowEditCategoryModal(true);
            }}
          >
            <Edit size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#ef4444" + "20" }]}
            onPress={() => handleDeleteCategory(category.id, category.name)}
          >
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBrandCard = (brand: Brand) => {
    const productCount = products.filter(p => p.brandId === brand.id).length;
    
    return (
      <TouchableOpacity
        key={brand.id}
        style={[styles.listCard, { backgroundColor: colors.card }]}
        onPress={() => {
          // Filter products by this brand
          setActiveTab("products");
          const filtered = products.filter(p => p.brandId === brand.id);
          setFilteredProducts(filtered);
          Alert.alert("Filter", `Menampilkan ${filtered.length} produk dengan brand "${brand.name}"`);
        }}
      >
        <View style={[styles.listIcon, { backgroundColor: colors.primary + "20" }]}>
          <Tag size={24} color={colors.primary} />
        </View>
        <View style={styles.listContent}>
          <Text style={[styles.listTitle, { color: colors.text }]}>
            {brand.name}
          </Text>
          <Text style={[styles.listSubtitle, { color: colors.textSecondary }]}>
            {productCount} produk
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary + "20" }]}
            onPress={() => {
              setSelectedBrand(brand);
              setShowEditBrandModal(true);
            }}
          >
            <Edit size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#ef4444" + "20" }]}
            onPress={() => handleDeleteBrand(brand.id, brand.name)}
          >
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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

      {/* Stats Cards */}
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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "products" && {
              borderBottomWidth: 2,
              borderBottomColor: colors.primary,
            },
          ]}
          onPress={() => setActiveTab("products")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "products" ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "categories" && {
              borderBottomWidth: 2,
              borderBottomColor: colors.primary,
            },
          ]}
          onPress={() => setActiveTab("categories")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "categories"
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "brands" && {
              borderBottomWidth: 2,
              borderBottomColor: colors.primary,
            },
          ]}
          onPress={() => setActiveTab("brands")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "brands" ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Brands
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={`Cari ${activeTab}...`}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Memuat data...
            </Text>
          </View>
        ) : (
          <>
            {activeTab === "products" && (
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
            )}

            {activeTab === "categories" && (
              <View style={styles.section}>
                {filteredCategories.length === 0 ? (
                  <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                    <Folder size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.text }]}>
                      {searchQuery ? "Kategori tidak ditemukan" : "Belum ada kategori"}
                    </Text>
                  </View>
                ) : (
                  filteredCategories.map(renderCategoryCard)
                )}
              </View>
            )}

            {activeTab === "brands" && (
              <View style={styles.section}>
                {filteredBrands.length === 0 ? (
                  <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                    <Tag size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.text }]}>
                      {searchQuery ? "Brand tidak ditemukan" : "Belum ada brand"}
                    </Text>
                  </View>
                ) : (
                  filteredBrands.map(renderBrandCard)
                )}
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          if (activeTab === "products") setShowProductModal(true);
          else if (activeTab === "categories") setShowCategoryModal(true);
          else if (activeTab === "brands") setShowBrandModal(true);
        }}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <AdminBottomNav />

      {/* Modals */}
      <AddProductModal
        visible={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSuccess={loadProducts}
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
        onSuccess={() => {
          loadCategories();
          loadProducts(); // Reload products to sync category names
          setShowEditCategoryModal(false);
          setSelectedCategory(null);
        }}
      />
      <EditBrandModal
        visible={showEditBrandModal}
        brand={selectedBrand}
        onClose={() => {
          setShowEditBrandModal(false);
          setSelectedBrand(null);
        }}
        onSuccess={() => {
          loadBrands();
          loadProducts(); // Reload products to sync brand names
          setShowEditBrandModal(false);
          setSelectedBrand(null);
        }}
      />
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
  tabsContainer: {
    flexDirection: "row",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
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
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
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
  cardMeta: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  cardStock: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
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
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
