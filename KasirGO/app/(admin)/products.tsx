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
  useWindowDimensions,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useAuth } from "../../src/context/AuthContext";
import { Package, Search, Settings, Plus, Edit, Trash2, Tag, Folder, ChevronDown, ChevronRight } from "lucide-react-native";
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
import EditProductModal from "../../src/components/modals/EditProductModal";

type TabType = "products" | "categories" | "brands";

export default function AdminProducts() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const layout = useWindowDimensions();

  // Redirect to login if not authenticated
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
  const [searchQuery, setSearchQuery] = useState("");

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  
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
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, products, categories, brands, index]);

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
    
    if (index === 0) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.brand?.category?.name.toLowerCase().includes(lowerQuery) ||
          p.brand?.name.toLowerCase().includes(lowerQuery)
      );
      setFilteredProducts(filtered);
    } else if (index === 1) {
      const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(lowerQuery)
      );
      setFilteredCategories(filtered);
    } else if (index === 2) {
      const filtered = brands.filter((b) =>
        b.name.toLowerCase().includes(lowerQuery) ||
        b.category?.name.toLowerCase().includes(lowerQuery)
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
              Alert.alert("Berhasil", "Kategori berhasil dihapus. Produk terkait telah diupdate.");
              await Promise.all([loadCategories(), loadProducts()]);
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
              await Promise.all([loadBrands(), loadProducts()]);
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
          <View style={[styles.badge, { backgroundColor: product.brand?.category ? "#3b82f6" + "20" : colors.border + "20" }]}>
            <Text style={[styles.badgeText, { color: product.brand?.category ? "#3b82f6" : colors.textSecondary }]}>
              {product.brand?.category ? product.brand.category.name : "Tanpa Kategori"}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: product.brand ? "#f59e0b" + "20" : colors.border + "20" }]}>
            <Text style={[styles.badgeText, { color: product.brand ? "#f59e0b" : colors.textSecondary }]}>
              {product.brand ? product.brand.name : "Tanpa Brand"}
            </Text>
          </View>
        </View>
        <Text style={[styles.cardStock, { color: product.stock < 10 ? "#ef4444" : colors.textSecondary }]}>
          Stok: {product.stock}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary + "20" }]}
          onPress={() => {
            setSelectedProduct(product);
            setShowEditProductModal(true);
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

  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderCategoryWithBrands = (category: Category) => {
    const categoryBrands = brands.filter(b => b.categoryId === category.id);
    const brandCount = categoryBrands.length;
    const productCount = products.filter(p => p.brand?.categoryId === category.id).length;
    const isExpanded = expandedCategories.has(category.id);
    
    return (
      <View key={category.id} style={styles.categoryContainer}>
        {/* Category Header */}
        <TouchableOpacity
          style={[styles.categoryHeader, { backgroundColor: colors.card }]}
          onPress={() => toggleCategoryExpand(category.id)}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={[styles.listIcon, { backgroundColor: colors.primary + "20" }]}>
              <Folder size={24} color={colors.primary} />
            </View>
            <View style={styles.listContent}>
              <Text style={[styles.listTitle, { color: colors.text }]}>
                {category.name}
              </Text>
              <Text style={[styles.listSubtitle, { color: colors.textSecondary }]}>
                {brandCount} brand • {productCount} produk
              </Text>
            </View>
            {brandCount > 0 && (
              isExpanded ? 
                <ChevronDown size={20} color={colors.textSecondary} /> :
                <ChevronRight size={20} color={colors.textSecondary} />
            )}
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary + "20" }]}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedCategory(category);
                setShowEditCategoryModal(true);
              }}
            >
              <Edit size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#ef4444" + "20" }]}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteCategory(category.id, category.name);
              }}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Expanded Brands */}
        {isExpanded && categoryBrands.length > 0 && (
          <View style={[styles.brandsContainer, { backgroundColor: colors.surface }]}>
            {categoryBrands.map((brand) => {
              const brandProductCount = products.filter(p => p.brandId === brand.id).length;
              return (
                <TouchableOpacity
                  key={brand.id}
                  style={[styles.brandItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    router.push({
                      pathname: "/productsByFilter",
                      params: {
                        type: "brand",
                        id: brand.id.toString(),
                        name: brand.name,
                      },
                    });
                  }}
                >
                  <View style={[styles.brandIcon, { backgroundColor: "#f59e0b" + "20" }]}>
                    <Tag size={18} color="#f59e0b" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.brandName, { color: colors.text }]}>
                      {brand.name}
                    </Text>
                    <Text style={[styles.brandCount, { color: colors.textSecondary }]}>
                      {brandProductCount} produk
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: colors.primary + "20" }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        setSelectedBrand(brand);
                        setShowEditBrandModal(true);
                      }}
                    >
                      <Edit size={14} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#ef4444" + "20" }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteBrand(brand.id, brand.name);
                      }}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderBrandCard = (brand: Brand) => {
    const productCount = products.filter(p => p.brandId === brand.id).length;
    
    return (
      <TouchableOpacity
        key={brand.id}
        style={[styles.listCard, { backgroundColor: colors.card }]}
        onPress={() => {
          // Navigate to products by filter screen
          router.push({
            pathname: "/productsByFilter",
            params: {
              type: "brand",
              id: brand.id.toString(),
              name: brand.name,
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
              {brand.name}
            </Text>
            {brand.category && (
              <View style={[styles.badge, { backgroundColor: "#3b82f6" + "20" }]}>
                <Text style={[styles.badgeText, { color: "#3b82f6" }]}>
                  {brand.category.name}
                </Text>
              </View>
            )}
          </View>
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

  const renderScene = ({ route }: any) => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Memuat data...
          </Text>
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
                refreshing={refreshing}
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
                refreshing={refreshing}
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
                    {searchQuery ? "Kategori tidak ditemukan" : "Belum ada kategori"}
                  </Text>
                </View>
              ) : (
                filteredCategories.map(renderCategoryWithBrands)
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
                refreshing={refreshing}
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
                    {searchQuery ? "Brand tidak ditemukan" : "Belum ada brand"}
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

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={`Cari ${getActiveTab()}...`}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* TabView */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />

      {/* FAB */}
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
      <EditProductModal
        visible={showEditProductModal}
        product={selectedProduct}
        onClose={() => {
          setShowEditProductModal(false);
          setSelectedProduct(null);
        }}
        onSuccess={() => {
          loadProducts();
          setShowEditProductModal(false);
          setSelectedProduct(null);
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
  categoryContainer: {
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  brandsContainer: {
    marginLeft: 16,
    marginTop: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  brandItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingLeft: 20,
    borderBottomWidth: 1,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  brandName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  brandCount: {
    fontSize: 12,
  },
});
