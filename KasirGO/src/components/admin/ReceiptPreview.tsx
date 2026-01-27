import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Animated } from "react-native";
import { Receipt, Info, CheckCircle } from "lucide-react-native";
import { getStoreSettings, Store } from "../../api/store";
import { useTheme } from "../../context/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";

interface ReceiptPreviewProps {
  store?: Store | null;
}

export default function ReceiptPreview({ store: externalStore }: ReceiptPreviewProps = {}) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(!externalStore);
  const [storeData, setStoreData] = useState<Store | null>(externalStore || null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Sample transaction data for preview
  const sampleTransaction = {
    dailyNumber: 1,
    cashier: "Admin",
    items: [
      { name: "Item 1", qty: 3, price: 3500, subtotal: 10500 },
      { name: "Item 2", qty: 2, price: 5000, subtotal: 10000 },
      { name: "Item 3", qty: 1, price: 3000, subtotal: 3000 },
    ],
    total: 23500,
    payment: 30000,
    change: 6500,
    paymentMethod: "CASH" as const,
  };

  useEffect(() => {
    if (!externalStore) {
      loadStoreData();
    }
  }, [externalStore]);

  // Auto-refresh when screen comes into focus (only if not using external store)
  useFocusEffect(
    React.useCallback(() => {
      if (!externalStore) {
        loadStoreData();
      }
    }, [externalStore])
  );

  // Handle external store updates
  useEffect(() => {
    if (externalStore) {
      setStoreData(externalStore);
      // Animate when external store data changes
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      });
    }
  }, [externalStore, fadeAnim, slideAnim]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      const response = await getStoreSettings();
      if (response.success && response.data) {
        setStoreData(response.data);
        // Animate when data loads
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -10,
            duration: 150,
            useNativeDriver: true,
          })
        ]).start(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            })
          ]).start();
        });
      }
    } catch (error) {
      console.error("Error loading store data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Memuat pratinjau...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Receipt size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Pratinjau Struk</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Pratinjau struk dengan data toko Anda
        </Text>

        {/* Receipt Preview */}
        <Animated.View
          style={[
            styles.receiptContainer,
            {
              backgroundColor: "#ffffff",
              borderColor: colors.border,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.receipt}>
            {/* Store Header */}
            <View style={styles.receiptHeader}>
              {storeData?.store_logo_url && (
                <Image
                  source={{ uri: storeData.store_logo_url }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              )}
              <Text style={[styles.storeName, { color: "#000000" }]}>
                {storeData?.store_name || "Nama Toko"}
              </Text>
              {storeData?.store_description && (
                <Text style={[styles.storeDescription, { color: "#666666" }]}>
                  {storeData.store_description}
                </Text>
              )}
              {storeData?.store_address && (
                <Text style={[styles.storeInfo, { color: "#666666" }]}>
                  {storeData.store_address}
                </Text>
              )}
              {(storeData?.store_phone || storeData?.store_email) && (
                <Text style={[styles.storeInfo, { color: "#666666" }]}>
                  {storeData?.store_phone && `Telepon: ${storeData.store_phone}`}
                  {storeData?.store_phone && storeData?.store_email && " | "}
                  {storeData?.store_email && `Email: ${storeData.store_email}`}
                </Text>
              )}
            </View>

            <View style={[styles.divider, { backgroundColor: "#e5e7eb" }]} />

            {/* Receipt Title - Centered */}
            <View style={styles.receiptTitleSection}>
              <Text style={[styles.receiptTitle, { color: "#000000" }]}>
                Transaksi
              </Text>
              <Text style={[styles.receiptId, { color: "#666666" }]}>
                #{sampleTransaction.dailyNumber.toString().padStart(3, '0')}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: "#e5e7eb" }]} />

            {/* Transaction Info */}
            <View style={styles.transactionInfo}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: "#666666" }]}>
                  Kasir:
                </Text>
                <Text style={[styles.infoValue, { color: "#000000" }]}>
                  {sampleTransaction.cashier}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: "#666666" }]}>
                  Total Item:
                </Text>
                <Text style={[styles.infoValue, { color: "#000000" }]}>
                  {sampleTransaction.items.length} item
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: "#e5e7eb" }]} />

            {/* Items */}
            <View style={styles.items}>
              <Text style={[styles.sectionTitle, { color: "#000000" }]}>
                Detail Pembelian
              </Text>
              {sampleTransaction.items.map((item, idx) => (
                <View key={idx} style={[styles.item, { borderBottomColor: "#e5e7eb" }]}>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: "#000000" }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.itemDetail, { color: "#666666" }]}>
                      {item.qty} x {formatCurrency(item.price)}
                    </Text>
                  </View>
                  <Text style={[styles.itemSubtotal, { color: "#000000" }]}>
                    {formatCurrency(item.subtotal)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[styles.divider, { backgroundColor: "#e5e7eb" }]} />

            {/* Total */}
            <View style={styles.total}>
              <View style={styles.totalRow}>
                <Text style={[styles.paymentLabel, { color: "#666666" }]}>Subtotal:</Text>
                <Text style={[styles.paymentValue, { color: "#000000" }]}>
                  {formatCurrency(sampleTransaction.total)}
                </Text>
              </View>
              <View style={[styles.totalRow, styles.mainTotal]}>
                <Text style={[styles.totalLabel, { color: "#000000" }]}>TOTAL:</Text>
                <Text style={[styles.totalValue, { color: "#000000" }]}>
                  {formatCurrency(sampleTransaction.total)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.paymentLabel, { color: "#666666" }]}>Metode:</Text>
                <Text style={[styles.paymentValue, { color: "#000000" }]}>
                  {sampleTransaction.paymentMethod === 'CASH' ? 'Tunai' :
                    sampleTransaction.paymentMethod === 'QRIS' ? 'QRIS' : 'Debit'}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.paymentLabel, { color: "#666666" }]}>Bayar:</Text>
                <Text style={[styles.paymentValue, { color: "#000000" }]}>
                  {formatCurrency(sampleTransaction.payment)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.paymentLabel, { color: "#666666" }]}>Kembalian:</Text>
                <Text style={[styles.paymentValue, { color: "#000000" }]}>
                  {formatCurrency(sampleTransaction.change)}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: "#e5e7eb" }]} />

            {/* Footer */}
            <View style={styles.receiptFooter}>
              <Text style={[styles.footerText, { color: "#666666" }]}>
                Terima kasih atas kunjungan Anda!
              </Text>
              <Text style={[styles.footerText, { color: "#666666" }]}>
                Made by KasirGo - @VoinzzZ
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Info Boxes */}
        <View style={styles.infoBoxes}>
          {/* Info */}
          <View style={[styles.infoBox, { backgroundColor: colors.card + "80", borderColor: "#3b82f6" }]}>
            <Info size={20} color="#3b82f6" />
            <View style={styles.infoBoxContent}>
              <Text style={[styles.infoBoxTitle, { color: "#3b82f6" }]}>Informasi</Text>
              <Text style={[styles.infoBoxText, { color: colors.textSecondary }]}>
                Pratinjau ini menunjukkan bagaimana struk akan tercetak dengan data toko Anda
              </Text>
            </View>
          </View>

          {/* Current Data */}
          <View style={[styles.infoBox, { backgroundColor: colors.card + "80", borderColor: "#10b981" }]}>
            <CheckCircle size={20} color="#10b981" />
            <View style={styles.infoBoxContent}>
              <Text style={[styles.infoBoxTitle, { color: "#10b981" }]}>Data Toko Saat Ini</Text>
              <View style={styles.dataList}>
                <Text style={[styles.dataItem, { color: colors.textSecondary }]}>
                  • Nama: {storeData?.store_name || "-"}
                </Text>
                <Text style={[styles.dataItem, { color: colors.textSecondary }]}>
                  • Alamat: {storeData?.store_address || "-"}
                </Text>
                <Text style={[styles.dataItem, { color: colors.textSecondary }]}>
                  • Telepon: {storeData?.store_phone || "-"}
                </Text>
                <Text style={[styles.dataItem, { color: colors.textSecondary }]}>
                  • Email: {storeData?.store_email || "-"}
                </Text>
                <Text style={[styles.dataItem, { color: colors.textSecondary }]}>
                  • Logo: {storeData?.store_logo_url ? "✓ Tersedia" : "✗ Belum diatur"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    margin: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  receiptContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  receipt: {
    gap: 16,
  },
  receiptHeader: {
    alignItems: "center",
    gap: 4,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  storeDescription: {
    fontSize: 12,
    textAlign: "center",
  },
  storeInfo: {
    fontSize: 11,
    textAlign: "center",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  receiptTitleSection: {
    alignItems: "center",
    gap: 4,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  receiptId: {
    fontSize: 14,
    textAlign: "center",
  },
  transactionInfo: {
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  items: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    alignItems: "flex-start",
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
  },
  itemDetail: {
    fontSize: 11,
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 16,
  },
  total: {
    gap: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainTotal: {
    paddingVertical: 4,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  paymentLabel: {
    fontSize: 13,
  },
  paymentValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  receiptFooter: {
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    textAlign: "center",
  },
  infoBoxes: {
    gap: 16,
  },
  infoBox: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  infoBoxContent: {
    flex: 1,
    gap: 8,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoBoxText: {
    fontSize: 12,
    lineHeight: 18,
  },
  dataList: {
    gap: 4,
  },
  dataItem: {
    fontSize: 11,
    lineHeight: 16,
  },
});
