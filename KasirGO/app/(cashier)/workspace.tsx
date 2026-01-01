import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ShoppingCart, Plus, Minus, X } from "lucide-react-native";
import { useRouter } from 'expo-router';
import CashierBottomNav from "../../src/components/navigation/CashierBottomNav";
import CategoryTabView from "../../src/components/shared/CategoryTabView";
import { useTheme } from "../../src/context/ThemeContext";
import { Product } from "../../src/api/product";
import { transactionService } from "../../src/api/transaction";
import { useOrientation } from "../../src/hooks/useOrientation";

export default function WorkspaceScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '50%', '90%'], []);

  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedBrandName, setSelectedBrandName] = useState<string>("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // Cart state
  interface CartItem extends Product {
    quantity: number;
  }
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('Bottom sheet changed to index:', index);
  }, []);

  const handleBrandFilter = (brandId: number | null, brandName: string) => {
    setSelectedBrandId(brandId);
    setSelectedBrandName(brandName);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        // Update quantity
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
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
    bottomSheetRef.current?.close();
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setCheckoutLoading(true);
    try {
      // Prepare transaction payload
      const transactionPayload = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      console.log('🚀 Transaction Payload:', JSON.stringify(transactionPayload, null, 2));

      // Create transaction
      const response = await transactionService.createTransaction(transactionPayload);
      if (response.success && response.data) {
        // Navigate to payment screen
        router.push(`/(cashier)/transaction/${response.data.id}`);
        // Clear cart after successful transaction creation
        setCart([]);
        bottomSheetRef.current?.close();
      }
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      const message = error.response?.data?.message || 'Failed to create transaction';
      Alert.alert('Error', message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const renderCartItem = (item: CartItem) => {
    const subtotal = item.price * item.quantity;
    
    return (
      <View key={item.id} style={[styles.cartItem, { borderBottomColor: colors.border }]}>
        <View style={styles.cartItemHeader}>
          <View style={styles.cartItemInfo}>
            <Text style={[styles.cartItemName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.cartItemPrice, { color: colors.textSecondary }]}>
              Rp {item.price.toLocaleString("id-ID")} × {item.quantity}
            </Text>
          </View>
          {item.quantity > 1 && (
            <Text style={[styles.cartItemSubtotal, { color: colors.primary }]}>
              Rp {subtotal.toLocaleString("id-ID")}
            </Text>
          )}
        </View>
        <View style={styles.cartItemActions}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => updateCartItemQuantity(item.id, item.quantity - 1)}
              activeOpacity={0.7}
            >
              <Minus size={20} color={colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={[styles.quantityDisplay, { backgroundColor: colors.card }]}>
              <Text style={[styles.quantityText, { color: colors.text }]}>
                {item.quantity}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.quantityButton, { backgroundColor: colors.primary }]}
              onPress={() => updateCartItemQuantity(item.id, item.quantity + 1)}
              activeOpacity={0.7}
            >
              <Plus size={20} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: "#fee2e2" }]}
            onPress={() => removeFromCart(item.id)}
            activeOpacity={0.7}
          >
            <X size={20} color="#ef4444" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const { isLandscape: isLand, isTablet: isTab } = useOrientation();

  return (
    <GestureHandlerRootView style={[styles.container, isLand && isTab ? styles.landscapeContainer : {}, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, isLand && isTab ? styles.landscapeHeader : {}, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, isLand && isTab ? styles.landscapeTitle : {}, { color: colors.text }]}>Workspace</Text>
        <Text style={[styles.subtitle, isLand && isTab ? styles.landscapeSubtitle : {}, { color: colors.textSecondary }]}>
          Geser tab kiri/kanan untuk pindah kategori
        </Text>
      </View>

      {/* Category TabView with Brand Filter and Products */}
      <View style={{ flex: 1 }}>
        <CategoryTabView
          selectedBrandId={selectedBrandId}
          selectedBrandName={selectedBrandName}
          onBrandFilter={handleBrandFilter}
          onAddToCart={addToCart}
        />
      </View>

      {/* Bottom Sheet Cart - Only show on portrait or phone landscape */}
      {!isLand || !isTab ? (
        <>
          {cart.length > 0 && (
            <BottomSheet
              ref={bottomSheetRef}
              index={1}
              snapPoints={snapPoints}
              onChange={handleSheetChanges}
              backgroundStyle={{ backgroundColor: colors.card }}
              handleIndicatorStyle={{ backgroundColor: colors.border }}
              enablePanDownToClose={false}
            >
              {/* Cart Summary Header */}
              <View style={[styles.cartSummary, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={styles.cartSummaryLeft}>
                  <View style={[styles.cartIconBadge, { backgroundColor: colors.primary }]}>
                    <ShoppingCart size={20} color="#fff" />
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={[styles.cartSummaryTitle, { color: colors.text }]}>
                      {getTotalItems()} Item{getTotalItems() > 1 ? 's' : ''}
                    </Text>
                    <Text style={[styles.cartSummaryPrice, { color: colors.primary }]}>
                      Rp {getTotalPrice().toLocaleString("id-ID")}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={clearCart}>
                  <Text style={[styles.clearCartText, { color: "#ef4444" }]}>
                    Kosongkan
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Cart Items */}
              <BottomSheetScrollView
                style={styles.cartItemsScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.cartItemsContainer}>
                  {cart.map(renderCartItem)}
                </View>
                <View style={{ height: 80 }} />
              </BottomSheetScrollView>
            </BottomSheet>
          )}

          {/* Floating Checkout Button */}
          {cart.length > 0 && (
            <TouchableOpacity
              style={[
                styles.checkoutFAB,
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
                  <ShoppingCart size={24} color="#fff" />
                  <Text style={styles.checkoutFABText}>Checkout</Text>
                  <View style={styles.checkoutBadge}>
                    <Text style={styles.checkoutBadgeText}>{getTotalItems()}</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          )}
        </>
      ) : (
        // For landscape tablet, show cart as a side panel
        <View style={styles.landscapeCartContainer}>
          {cart.length > 0 ? (
            <>
              {/* Cart Summary Header */}
              <View style={[styles.landscapeCartSummary, { backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={styles.cartSummaryLeft}>
                  <View style={[styles.cartIconBadge, { backgroundColor: colors.primary }]}>
                    <ShoppingCart size={20} color="#fff" />
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={[styles.cartSummaryTitle, { color: colors.text }]}>
                      {getTotalItems()} Item{getTotalItems() > 1 ? 's' : ''}
                    </Text>
                    <Text style={[styles.cartSummaryPrice, { color: colors.primary }]}>
                      Rp {getTotalPrice().toLocaleString("id-ID")}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={clearCart}>
                  <Text style={[styles.clearCartText, { color: "#ef4444" }]}>
                    Kosongkan
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Cart Items */}
              <View style={styles.landscapeCartItemsScroll}>
                <View style={styles.cartItemsContainer}>
                  {cart.map(renderCartItem)}
                </View>
              </View>

              {/* Checkout Button for landscape tablet */}
              <TouchableOpacity
                style={[
                  styles.landscapeCheckoutButton,
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
                    <ShoppingCart size={24} color="#fff" />
                    <Text style={styles.checkoutFABText}>Checkout</Text>
                    <View style={styles.checkoutBadge}>
                      <Text style={styles.checkoutBadgeText}>{getTotalItems()}</Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyLandscapeCart}>
              <Text style={{ color: colors.textSecondary }}>Keranjang kosong</Text>
            </View>
          )}
        </View>
      )}

      <CashierBottomNav />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
