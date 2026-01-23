import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Package, Plus, MoreVertical } from "lucide-react-native";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";
import {
  Product,
  getProductsByCategory,
  getProductsByBrand,
  deleteProduct,
} from "../src/api/product";
import { formatPrice, getStockStatus, getStockStatusColor, calculateProfitMargin } from "../src/utils/product.helpers";
import { STOCK_STATUS } from "../src/constants/product.constants";
import EditProductModal from "../src/components/cashier/modals/EditProductModal";
import SelectProductModal from "../src/components/cashier/modals/SelectProductModal";

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
  const [showSelectModal, setShowSelectModal] = useState(false);
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
              await loadProducts();
              setShowEditModal(false);
              setSelectedProduct(null);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Gagal menghapus produk");
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
        <View style={styles.imageContainer}>
          {product.product_image_url ? (
            <Image
              source={{ uri: product.product_image_url }}
              style={styles.productImageSmall}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImagePlaceholderSmall, { backgroundColor: colors.primary + "20" }]}>
              <Package size={24} color={colors.primary} />
            </View>
          )}
        </View>
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
              setShowEditModal(true);
            }}
          >
            <MoreVertical size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        ) : (
          <View style={styles.section}>
            {products.length === 0 ? (
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
              products.map(renderProductCard)
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB untuk Select Product (ADMIN only) */}
      {user?.role === "ADMIN" && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => setShowSelectModal(true)}
        >
          <Plus size={28} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Modals */}
      <EditProductModal
        visible={showEditModal}
        product={selectedProduct}
        onDelete={handleDeleteProduct}
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
      <SelectProductModal
        visible={showSelectModal}
        type={type}
        filterId={parseInt(id)}
        filterName={name}
        onClose={() => setShowSelectModal(false)}
        onSuccess={() => {
          loadProducts();
          setShowSelectModal(false);
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
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    flex: 1,
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
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
  card: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  imageContainer: {
    marginRight: 12,
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
});