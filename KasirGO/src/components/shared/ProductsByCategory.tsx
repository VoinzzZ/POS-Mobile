import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  FlatList,
} from "react-native";
import { Package, ShoppingCart } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useOrientation } from "../../hooks/useOrientation";
import {
  Product,
  getAllProducts,
} from "../../api/product";

interface ProductsByCategoryProps {
  categoryId: number | null;
  categoryName: string;
  brandId?: number | null;
  brandName?: string;
  onAddToCart?: (product: Product) => void;
}

export default function ProductsByCategory({
  categoryId,
  categoryName,
  brandId = null,
  brandName = "",
  onAddToCart,
}: ProductsByCategoryProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { isLandscape: isLand, isTablet: isTab } = useOrientation();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [categoryId, brandId]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Get all products first, then filter client-side for more flexibility
      const response = await getAllProducts();

      if (response.success && response.data) {
        let filteredProducts = response.data;

        // Filter by category if specified
        if (categoryId !== null) {
          filteredProducts = filteredProducts.filter(product =>
            product.product_category_id === categoryId
          );
        }

        // Filter by brand if specified
        if (brandId !== null) {
          filteredProducts = filteredProducts.filter(product =>
            product.product_brand_id === brandId
          );
        }

        setProducts(filteredProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, [categoryId, brandId]);

  const handleAddToCart = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const renderProductCard = (product: Product) => (
    <View style={styles.productCard}>
      <TouchableOpacity
        style={[styles.productCardInner, { backgroundColor: colors.card }]}
        onPress={() => handleAddToCart(product)}
        activeOpacity={0.7}
      >
        <View style={styles.productImageContainer}>
          {product.product_image_url ? (
            <Image
              source={{ uri: product.product_image_url }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImagePlaceholder, { backgroundColor: colors.primary + "20" }]}>
              <Package size={32} color={colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>
            Rp {product.price.toLocaleString("id-ID")}
          </Text>
          <Text style={[styles.productStock, {
            color: product.stock < 10 ? "#ef4444" : colors.textSecondary
          }]}>
            Stok: {product.stock}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderProducts = () => {
    if (products.length === 0) {
      return (
        <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
          <Package size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Tidak ada produk
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {brandId !== null && brandName
              ? `Belum ada produk untuk brand "${brandName}" dalam kategori "${categoryName}"`
              : `Belum ada produk dalam kategori "${categoryName}"`
            }
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={products}
        renderItem={({ item }) => renderProductCard(item)}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.flatListContent}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Memuat produk...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {categoryName}
        </Text>
        {brandId !== null && brandName && (
          <Text style={[styles.headerSubtitle, { color: colors.primary }]}>
            Brand: {brandName}
          </Text>
        )}
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {products.length} produk tersedia
        </Text>
      </View>

      {/* Products Grid */}
      {renderProducts()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 14,
  },
  productsGrid: {
    paddingHorizontal: 14,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  productCard: {
    width: "33.33%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  productCardInner: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageContainer: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productImagePlaceholder: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    padding: 12,
    gap: 4,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
    lineHeight: 18,
    minHeight: 36,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "600",
  },
  productStock: {
    fontSize: 11,
    fontWeight: "500",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    margin: 20,
    padding: 30,
    alignItems: "center",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
  },
});