import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ShoppingCart, Plus, Minus, Trash2, Save, X } from "lucide-react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { transactionService, Transaction } from "../../../src/api/transaction";
import { getAllProducts, Product } from "../../../src/api/product";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTransactionAndProducts();
  }, []);

  const loadTransactionAndProducts = async () => {
    try {
      setLoading(true);
      
      // Load transaction detail
      const transactionResponse = await transactionService.getTransactionDetail(Number(id));
      if (transactionResponse.success && transactionResponse.data) {
        setTransaction(transactionResponse.data);
        
        // Convert transaction items to cart items
        const cartItems: CartItem[] = transactionResponse.data.items.map(item => ({
          productId: item.productId,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.product.imageUrl,
        }));
        setCart(cartItems);
      }

      // Load all products
      const productsResponse = await getAllProducts();
      if (productsResponse.success && productsResponse.data) {
        const productsList = Array.isArray(productsResponse.data) 
          ? productsResponse.data 
          : productsResponse.data.data || [];
        setProducts(productsList);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Gagal memuat data transaksi");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Increase quantity
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new item
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
      }]);
    }
  };

  const updateQuantity = (productId: number, change: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSave = async () => {
    if (cart.length === 0) {
      Alert.alert("Keranjang Kosong", "Tambahkan minimal 1 produk ke keranjang");
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await transactionService.updateTransaction(Number(id), payload);
      
      if (response.success) {
        console.log('✅ Transaction updated successfully');
        // Navigate back immediately - history screen will auto-refresh
        router.back();
      }
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      Alert.alert("Error", error.response?.data?.message || "Gagal mengupdate transaksi");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Langsung kembali tanpa konfirmasi
    router.back();
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Memuat data transaksi...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={[styles.title, { color: colors.text }]}>
            Edit Transaksi #{id}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ubah items transaksi
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Products List */}
        <View style={styles.productsSection}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Cari produk..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <ScrollView 
            style={styles.productsList}
            contentContainerStyle={styles.productsContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredProducts.map((product) => {
              const inCart = cart.find(item => item.productId === product.id);
              return (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.productCard,
                    { backgroundColor: colors.surface },
                    inCart && { borderColor: colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => addToCart(product)}
                >
                  {product.imageUrl ? (
                    <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                  ) : (
                    <View style={[styles.productImagePlaceholder, { backgroundColor: colors.background }]}>
                      <Text style={[styles.productImagePlaceholderText, { color: colors.textSecondary }]}>
                        {product.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={[styles.productPrice, { color: colors.primary }]}>
                      {formatCurrency(product.price)}
                    </Text>
                    <Text style={[styles.productStock, { color: colors.textSecondary }]}>
                      Stok: {product.stock}
                    </Text>
                  </View>
                  {inCart && (
                    <View style={[styles.inCartBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.inCartText}>{inCart.quantity}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Cart Section */}
        <View style={[styles.cartSection, { backgroundColor: colors.surface }]}>
          <View style={styles.cartHeader}>
            <ShoppingCart size={20} color={colors.text} />
            <Text style={[styles.cartTitle, { color: colors.text }]}>
              Keranjang ({cart.length})
            </Text>
          </View>

          <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
            {cart.length === 0 ? (
              <Text style={[styles.emptyCart, { color: colors.textSecondary }]}>
                Keranjang kosong
              </Text>
            ) : (
              cart.map((item) => (
                <View key={item.productId} style={[styles.cartItem, { borderBottomColor: colors.border }]}>
                  <View style={styles.cartItemHeader}>
                    <View style={styles.cartItemInfo}>
                      <Text style={[styles.cartItemName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.cartItemPrice, { color: colors.textSecondary }]}>
                        {formatCurrency(item.price)} × {item.quantity}
                      </Text>
                    </View>
                    <Text style={[styles.cartItemSubtotal, { color: colors.primary }]}>
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </View>
                  
                  <View style={styles.cartItemActions}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.productId, -1)}
                        style={[styles.quantityButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                        activeOpacity={0.7}
                      >
                        <Minus size={20} color={colors.text} strokeWidth={2.5} />
                      </TouchableOpacity>
                      <View style={[styles.quantityDisplay, { backgroundColor: colors.card }]}>
                        <Text style={[styles.quantity, { color: colors.text }]}>
                          {item.quantity}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.productId, 1)}
                        style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                        activeOpacity={0.7}
                      >
                        <Plus size={20} color="#fff" strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeFromCart(item.productId)}
                      style={[styles.deleteButton, { backgroundColor: "#fee2e2" }]}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={20} color="#ef4444" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Total & Actions */}
          <View style={[styles.cartFooter, { borderTopColor: colors.border }]}>
            <View style={styles.totalSection}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                Total:
              </Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>
                {formatCurrency(calculateTotal())}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.background }]}
                onPress={handleCancel}
                disabled={saving}
              >
                <X size={20} color={colors.text} />
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Batal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor: colors.primary },
                  (saving || cart.length === 0) && styles.disabledButton
                ]}
                onPress={handleSave}
                disabled={saving || cart.length === 0}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Save size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Simpan</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  productsSection: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 12,
  },
  productsList: {
    flex: 1,
  },
  productsContent: {
    gap: 12,
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    gap: 12,
    alignItems: "center",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  productImagePlaceholderText: {
    fontSize: 24,
    fontWeight: "700",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  productStock: {
    fontSize: 12,
  },
  inCartBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  inCartText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  cartSection: {
    width: 380,
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
  },
  cartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cartList: {
    flex: 1,
  },
  emptyCart: {
    textAlign: "center",
    padding: 32,
    fontSize: 14,
  },
  cartItem: {
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  cartItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cartItemInfo: {
    flex: 1,
    gap: 4,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  cartItemPrice: {
    fontSize: 13,
  },
  cartItemActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityDisplay: {
    minWidth: 50,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  quantity: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cartItemSubtotal: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "right",
  },
  cartFooter: {
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
