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
import { ShoppingCart, Plus, Minus, Trash2, Save, X } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { transactionService, Transaction } from "../../api/transaction";
import { getAllProducts, Product } from "../../api/product";
import SlideModal from "./SlideModal";

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
}

interface TransactionEditModalProps {
  visible: boolean;
  transactionId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function TransactionEditModal({
  visible,
  transactionId,
  onClose,
  onSaved,
}: TransactionEditModalProps) {
  const { colors } = useTheme();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (visible && transactionId) {
      loadTransactionAndProducts();
    } else {
      // Reset state when modal closes
      setTransaction(null);
      setCart([]);
      setSearchQuery("");
    }
  }, [visible, transactionId]);

  const loadTransactionAndProducts = async () => {
    try {
      setLoading(true);

      // Load transaction detail
      const transactionResponse = await transactionService.getTransactionDetail(transactionId!);
      if (transactionResponse.success && transactionResponse.data) {
        setTransaction(transactionResponse.data);

        // Convert transaction items to cart items
        const cartItems: CartItem[] = transactionResponse.data.items.map((item) => ({
          product_id: item.productId,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.product.imageUrl,
        }));
        setCart(cartItems);
      }

      // Load all products
      const productsResponse = await getAllProducts();
      if (productsResponse.success && productsResponse.data) {
        setProducts(productsResponse.data);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      Alert.alert("Kesalahan", "Gagal memuat data transaksi");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product_id === product.product_id);

    if (existingItem) {
      // Increase quantity
      setCart(
        cart.map((item) =>
          item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      // Add new item
      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.imageUrl,
        },
      ]);
    }
  };

  const updateQuantity = (productId: number, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.product_id === productId) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSave = async () => {
    if (cart.length === 0) {
      Alert.alert("Keranjang Kosong", "Tambahkan minimal 1 produk ke keranjang");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      const response = await transactionService.updateTransaction(transactionId!, payload);

      if (response.success) {
        console.log("✅ Transaksi berhasil diperbarui");
        onSaved();
        onClose();
      }
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      Alert.alert("Kesalahan", error.response?.data?.message || "Gagal mengupdate transaksi");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SlideModal visible={visible} onClose={onClose} backgroundColor={colors.card}>
      {loading ? (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Memuat data transaksi...
          </Text>
        </View>
      ) : (
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <Text style={[styles.title, { color: colors.text }]}>
                Edit Transaksi #{transactionId}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Ubah items transaksi
              </Text>
            </View>
          </View>

          {/* Cart Section - Full Width */}
          <View style={[styles.cartSectionFullWidth, { backgroundColor: colors.surface }]}>
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
                  <View
                    key={item.product_id}
                    style={[styles.cartItem, { borderBottomColor: colors.border }]}
                  >
                    <View style={styles.cartItemInfo}>
                      <Text style={[styles.cartItemName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.cartItemPrice, { color: colors.textSecondary }]}>
                        {formatCurrency(item.price)}
                      </Text>
                    </View>

                    <View style={styles.cartItemActions}>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          onPress={() => updateQuantity(item.product_id, -1)}
                          style={[styles.quantityButton, { backgroundColor: colors.background }]}
                        >
                          <Minus size={16} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.quantity, { color: colors.text }]}>
                          {item.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={() => updateQuantity(item.product_id, 1)}
                          style={[styles.quantityButton, { backgroundColor: colors.background }]}
                        >
                          <Plus size={16} color={colors.text} />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={() => removeFromCart(item.product_id)}
                        style={styles.deleteButton}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.cartItemSubtotal, { color: colors.primary }]}>
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Total & Actions */}
            <View style={[styles.cartFooter, { borderTopColor: colors.border }]}>
              <View style={styles.totalSection}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total:</Text>
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
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: colors.primary },
                    (saving || cart.length === 0) && styles.disabledButton,
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
      )}
    </SlideModal>
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
  cartSectionFullWidth: {
    flex: 1,
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
    gap: 8,
  },
  cartItemInfo: {
    gap: 2,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: "600",
  },
  cartItemPrice: {
    fontSize: 12,
  },
  cartItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 32,
    textAlign: "center",
  },
  deleteButton: {
    padding: 8,
  },
  cartItemSubtotal: {
    fontSize: 16,
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