import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ShoppingCart } from "lucide-react-native";
import { useRouter } from 'expo-router';
import CashierSidebar from "../../src/components/navigation/CashierSidebar";
import CategoryTabView from "../../src/components/shared/CategoryTabView";
import CartItem from "../../src/components/cashier/CartItem";
import CartSummary from "../../src/components/cashier/CartSummary";
import PaymentModal from "../../src/components/cashier/PaymentModal";
import { useTheme } from "../../src/context/ThemeContext";
import { Product } from "../../src/api/product";
import { transactionService } from "../../src/api/transaction";

export default function WorkspaceScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedBrandName, setSelectedBrandName] = useState<string>("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  interface CartItem extends Product {
    quantity: number;
  }
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const handleBrandFilter = (brandId: number | null, brandName: string) => {
    setSelectedBrandId(brandId);
    setSelectedBrandName(brandName);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  const updateCartItemQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setPaymentModalVisible(true);
  };

  const handlePaymentComplete = async (paymentData: {
    payment_amount: number;
    payment_method: "CASH" | "QRIS" | "DEBIT";
  }) => {
    setCheckoutLoading(true);
    try {
      const transactionPayload = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      const createResponse = await transactionService.createTransaction(transactionPayload);
      if (createResponse.success && createResponse.data) {
        const completeResponse = await transactionService.completePayment(
          createResponse.data.id,
          paymentData.payment_amount,
          paymentData.payment_method
        );

        if (completeResponse.success && completeResponse.data) {
          setCart([]);
          setPaymentModalVisible(false);
          router.push(`/(cashier)/receipt/${completeResponse.data.id}`);
        }
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      const message = error.response?.data?.message || 'Gagal memproses pembayaran';
      throw new Error(message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.landscapeMaster}>
        <CashierSidebar />
        <View style={styles.landscapeContent}>
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.text }]}>Workspace</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Pilih produk dan kelola keranjang belanja
            </Text>
          </View>

          <View style={styles.landscapeLayout}>
            <View style={styles.catalogSection}>
              <CategoryTabView
                selectedBrandId={selectedBrandId}
                selectedBrandName={selectedBrandName}
                onBrandFilter={handleBrandFilter}
                onAddToCart={addToCart}
              />
            </View>

            <View style={[styles.cartSection, { backgroundColor: colors.surface, borderLeftColor: colors.border }]}>
              {cart.length > 0 ? (
                <>
                  <CartSummary
                    totalItems={getTotalItems()}
                    totalPrice={getTotalPrice()}
                    onClearCart={clearCart}
                  />

                  <ScrollView
                    style={styles.cartItemsScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.cartItemsContainer}>
                      {cart.map((item) => (
                        <CartItem
                          key={item.id}
                          item={{
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity
                          }}
                          onQuantityChange={updateCartItemQuantity}
                          onRemove={removeFromCart}
                        />
                      ))}
                    </View>
                    <View style={{ height: 20 }} />
                  </ScrollView>

                  <TouchableOpacity
                    style={[
                      styles.checkoutButton,
                      { backgroundColor: colors.primary },
                      checkoutLoading && styles.disabledButton
                    ]}
                    onPress={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <ShoppingCart size={20} color="#fff" />
                        <Text style={styles.checkoutButtonText}>
                          Checkout ({getTotalItems()})
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.emptyCart}>
                  <ShoppingCart size={64} color={colors.textSecondary} opacity={0.3} />
                  <Text style={[styles.emptyCartText, { color: colors.textSecondary }]}>
                    Keranjang Kosong
                  </Text>
                  <Text style={[styles.emptyCartSubtext, { color: colors.textSecondary }]}>
                    Pilih produk untuk memulai transaksi
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <PaymentModal
        visible={paymentModalVisible}
        cart={cart}
        onClose={() => setPaymentModalVisible(false)}
        onPaymentComplete={handlePaymentComplete}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  // Cart Bottom Sheet Styles
  cartSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  cartSummaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cartIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  cartSummaryTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  cartSummaryPrice: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  cartItemsContainer: {
    paddingBottom: 20,
  },
  clearCartText: {
    fontSize: 14,
    fontWeight: "600",
  },
  cartItemsScroll: {
    paddingHorizontal: 16,
  },
  cartItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  cartItemSubtotal: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
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
    alignItems: "center",
    justifyContent: "center",
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Floating Checkout Button
  checkoutFAB: {
    position: "absolute",
    right: 20,
    bottom: 90,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: 8,
  },
  checkoutFABText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  checkoutBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  checkoutBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  landscapeContainer: {
    flexDirection: 'row',
  },
  landscapeHeader: {
    paddingTop: 40,
    paddingBottom: 12,
  },
  landscapeTitle: {
    fontSize: 28,
  },
  landscapeSubtitle: {
    fontSize: 16,
  },
  landscapeCartContainer: {
    width: 350,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  landscapeCartSummary: {
    padding: 16,
    paddingBottom: 12,
  },
  landscapeCartItemsScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  landscapeCheckoutButton: {
    margin: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyLandscapeCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  landscapeMaster: {
    flex: 1,
    flexDirection: "row",
  },
  landscapeContent: {
    flex: 1,
    flexDirection: "column",
  },
  landscapeLayout: {
    flex: 1,
    flexDirection: "row",
  },
  catalogSection: {
    flex: 3,
    minWidth: "60%",
  },
  cartSection: {
    flex: 2,
    minWidth: "40%",
    borderLeftWidth: 1,
  },
  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emptyCartText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  emptyCartSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});
