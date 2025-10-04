import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Package, ShoppingCart, Edit, Trash2, Plus } from "lucide-react-native";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";
import {
  Product,
  getProductsByCategory,
  getProductsByBrand,
  deleteProduct,
} from "../src/api/product";
import EditProductModal from "../src/components/modals/EditProductModal";
import AddProductModal from "../src/components/modals/AddProductModal";

export default function ProductsByFilterScreen() {
  const params = useLocalSearchParams();
  const type = params.type as "category" | "brand";
  const id = params.id as string;
  const name = params.name as string;
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (type && id) {
      loadProducts();
    }
  }, [type, id]);

  const loadProducts = async () => {
    if (!type || !id) return;
    
    setLoading(true);
    try {
      let response;
      const filterId = parseInt(id);
      
      if (type === "category") {
        response = await getProductsByCategory(filterId);
      } else if (type === "brand") {
        response = await getProductsByBrand(filterId);
      }

      if (response?.success && response.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading filtered products:", error);
      Alert.alert("Error", "Gagal memuat produk");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, []);

  const handleAddToCart = (product: Product) => {
    // TODO: Implement add to cart functionality
    Alert.alert(
      "Tambah ke Keranjang",
      `Menambahkan "${product.name}" ke keranjang?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Tambah", 
          onPress: () => {
            // TODO: Add to cart logic here
            Alert.alert("Berhasil", `${product.name} ditambahkan ke keranjang!`);
          }
        },
      ]
    );
  };

  const handleDeleteProduct = (productId: number, productName: string) => {
    Alert.alert(
      "Hapus Produk",
      `Yakin ingin menghapus "${productName}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(productId);
              Alert.alert("Berhasil", "Produk berhasil dihapus");
              await loadProducts();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Gagal menghapus produk");
            }
          },
        },
      ]
    );
  };

  const renderProductCard = (product: Product) => (
    <View
      key={product.id}
      style={[styles.productCard, { backgroundColor: colors.card }]}
    >
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImagePlaceholder, { backgroundColor: colors.primary + "20" }]}>
          <Package size={32} color={colors.primary} />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={[styles.productPrice, { color: colors.primary }]}>
          Rp {product.price.toLocaleString("id-ID")}
        </Text>
        <View style={styles.productMeta}>
          {product.brand?.category && (
            <View style={[styles.badge, { backgroundColor: "#3b82f6" + "20" }]}>
              <Text style={[styles.badgeText, { color: "#3b82f6" }]}>
                {product.brand.category.name}
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
        <Text style={[styles.productStock, { 
          color: product.stock < 10 ? "#ef4444" : colors.textSecondary 
        }]}>
          Stok: {product.stock}
        </Text>
      </View>
      {user?.role === "ADMIN" ? (
        <View style={styles.adminActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary + "20" }]}
            onPress={() => {
              setSelectedProduct(product);
              setShowEditModal(true);
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
      ) : user?.role === "CASHIER" ? (
        <TouchableOpacity
          style={[styles.addButton, { 
            backgroundColor: product.stock > 0 ? colors.primary : colors.border,
            opacity: product.stock > 0 ? 1 : 0.5
          }]}
          onPress={() => handleAddToCart(product)}
          disabled={product.stock === 0}
        >
          <ShoppingCart size={16} color="#ffffff" />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (!type || !id || !name) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Parameter tidak valid
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {name}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {type === "category" ? "Kategori" : "Brand"} • {products.length} produk
          </Text>
        </View>
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
              Memuat produk...
            </Text>
          </View>
        ) : products.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
            <Package size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              Tidak ada produk
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Belum ada produk dalam {type === "category" ? "kategori" : "brand"} "{name}"
            </Text>
          </View>
        ) : (
          <View style={styles.productsContainer}>
            {products.map(renderProductCard)}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB untuk Add Product (ADMIN only) */}
      {user?.role === "ADMIN" && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={28} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Modals */}
      <EditProductModal
        visible={showEditModal}
        product={selectedProduct}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onSuccess={() => {
          loadProducts();
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
      />
      <AddProductModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadProducts();
          setShowAddModal(false);
        }}
        preSelectedCategoryId={type === "category" ? parseInt(id) : undefined}
        preSelectedBrandId={type === "brand" ? parseInt(id) : undefined}
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  productsContainer: {
    padding: 20,
    gap: 16,
  },
  productCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    alignItems: "flex-start",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
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
  productStock: {
    fontSize: 12,
    fontWeight: "500",
  },
  adminActions: {
    flexDirection: "column",
    gap: 8,
    marginLeft: 12,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
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
  loadingContainer: {
    padding: 60,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    margin: 20,
    padding: 40,
    alignItems: "center",
    borderRadius: 12,
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
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});