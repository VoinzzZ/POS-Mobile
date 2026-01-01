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
            product.brand?.categoryId === categoryId
          );
        }
        
        // Filter by brand if specified
        if (brandId !== null) {
          filteredProducts = filteredProducts.filter(product => 
            product.brandId === brandId
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
    <TouchableOpacity
      key={product.id}
      style={[styles.productCard, { backgroundColor: colors.card }]}
      onPress={() => handleAddToCart(product)}
      activeOpacity={0.7}
    >
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImagePlaceholder, { backgroundColor: colors.primary + "20" }]}>
          <Package size={24} color={colors.primary} />
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
    </TouchableOpacity>
  );

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
        {products.length === 0 ? (
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
        ) : (
          <View style={styles.productsContainer}>
            {products.map(renderProductCard)}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
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
  productsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  productCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    alignItems: "flex-start",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
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