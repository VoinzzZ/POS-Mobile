import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  BackHandler,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Receipt, Check, Store as StoreIcon } from "lucide-react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { useOrientation } from "../../../src/hooks/useOrientation";
import { transactionService, Transaction } from "../../../src/api/transaction";
import { getStoreSettings, Store } from "../../../src/api/store";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import CashierSidebar from "../../../src/components/navigation/CashierSidebar";

export default function ReceiptPreviewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { isLandscape, isTablet } = useOrientation();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [storeData, setStoreData] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const receiptRef = useRef<View>(null);

  const showLandscape = isLandscape && isTablet;

  useEffect(() => {
    loadTransactionData();

    // Prevent hardware back button on Android
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // Return true to prevent default back behavior
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  const loadTransactionData = async () => {
    try {
      setLoading(true);
      // Load both transaction and store data in parallel
      const [transactionResponse, storeResponse] = await Promise.all([
        transactionService.getReceiptData(Number(id)),
        getStoreSettings(),
      ]);

      if (transactionResponse.success && transactionResponse.data) {
        setTransaction(transactionResponse.data);
        if (storeResponse.success && storeResponse.data) {
          setStoreData(storeResponse.data);
        }
      } else {
        Alert.alert("Error", "Gagal memuat data transaksi");
        router.back();
      }
    } catch (error: any) {
      console.error("Error loading transaction:", error);
      Alert.alert("Error", error.response?.data?.message || "Gagal memuat data transaksi");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!receiptRef.current) return;

    try {
      setGenerating(true);

      // Capture the receipt component as PNG
      const uri = await captureRef(receiptRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      console.log("✅ Image generated:", uri);
      setImageUri(uri);

      return uri;
    } catch (error) {
      console.error("Error generating image:", error);
      Alert.alert("Error", "Gagal generate struk");
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  const handleShareReceipt = async () => {
    if (!transaction) {
      Alert.alert("Error", "Data transaksi belum siap");
      return;
    }

    try {
      setGenerating(true);

      // Generate image when user clicks share
      const uri = await generateImage();
      if (!uri) {
        Alert.alert("Error", "Gagal generate struk");
        return;
      }

      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Bagikan Struk",
        });
      } else {
        Alert.alert("Error", "Sharing tidak tersedia di perangkat ini");
      }
    } catch (error: any) {
      console.error("Error sharing receipt:", error);
      // Only show error if it's not a user cancellation
      if (error?.message && !error.message.includes('cancel') && !error.message.includes('dismissed')) {
        Alert.alert("Error", "Gagal membagikan struk");
      }
    } finally {
      setGenerating(false);
    }
  };



  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Memuat data struk...
        </Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Data transaksi tidak ditemukan
        </Text>
      </View>
    );
  }

  const ReceiptContent = () => (
    <View
      ref={receiptRef}
      style={[styles.receiptCard, { backgroundColor: colors.surface }]}
      collapsable={false}
    >
      <View style={styles.storeHeader}>
        {storeData?.logoUrl ? (
          <Image
            source={{ uri: storeData.logoUrl }}
            style={styles.storeLogo}
            resizeMode="contain"
          />
        ) : (
          <StoreIcon size={48} color={colors.primary} />
        )}
        <Text style={[styles.storeName, { color: colors.text }]}>
          {storeData?.name || "KasirGO"}
        </Text>
        {storeData?.description && (
          <Text style={[styles.storeDescription, { color: colors.textSecondary }]}>
            {storeData.description}
          </Text>
        )}
        {storeData?.address && (
          <Text style={[styles.storeAddress, { color: colors.textSecondary }]}>
            {storeData.address}
          </Text>
        )}
        {(storeData?.phone || storeData?.email) && (
          <Text style={[styles.storeContact, { color: colors.textSecondary }]}>
            {storeData?.phone && `Telp: ${storeData.phone}`}
            {storeData?.phone && storeData?.email && " | "}
            {storeData?.email && `Email: ${storeData.email}`}
          </Text>
        )}
      </View>

      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

      <View style={styles.receiptHeader}>
        <Text style={[styles.receiptTitle, { color: colors.text }]}>
          Struk Transaksi
        </Text>
        <Text style={[styles.receiptId, { color: colors.textSecondary }]}>
          #{transaction.id}
        </Text>
      </View>

      <View style={[styles.infoSection, { borderTopColor: colors.border }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Kasir:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {transaction.cashier?.userName || "N/A"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Total Item:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {transaction.items.length} item
          </Text>
        </View>
      </View>

      <View style={[styles.itemsSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Detail Pembelian
        </Text>
        {transaction.items.map((item) => (
          <View key={item.id} style={[styles.item, { borderBottomColor: colors.border }]}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {item.product.name}
              </Text>
              <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>
                {item.quantity} x {formatCurrency(item.price)}
              </Text>
            </View>
            <Text style={[styles.itemTotal, { color: colors.text }]}>
              {formatCurrency(item.subtotal)}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.totalsSection, { borderTopColor: colors.border }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            Subtotal:
          </Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>
            {formatCurrency(transaction.total)}
          </Text>
        </View>
        <View style={[styles.totalRow, styles.mainTotal]}>
          <Text style={[styles.totalLabel, styles.mainTotalText, { color: colors.primary }]}>
            TOTAL:
          </Text>
          <Text style={[styles.totalValue, styles.mainTotalText, { color: colors.primary }]}>
            {formatCurrency(transaction.total)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            Metode:
          </Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>
            {transaction.paymentMethod === 'CASH' ? 'Tunai' :
              transaction.paymentMethod === 'QRIS' ? 'QRIS' : 'Debit'}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            Bayar:
          </Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>
            {formatCurrency(transaction.paymentAmount || 0)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            Kembalian:
          </Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>
            {formatCurrency(transaction.changeAmount || 0)}
          </Text>
        </View>
      </View>

      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

      <View style={styles.receiptFooter}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Terima kasih atas kunjungan Anda!
        </Text>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Made by KasirGo - @VoinzzZ
        </Text>
      </View>
    </View>
  );

  if (showLandscape) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.landscapeMaster}>
          <CashierSidebar />
          <View style={styles.landscapeContent}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
              <View style={styles.headerContent}>
                <Text style={[styles.title, { color: colors.text }]}>Preview Struk</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Transaksi #{transaction.id}
                </Text>
              </View>
            </View>

            <ScrollView
              style={styles.landscapeScroll}
              contentContainerStyle={styles.landscapeScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.receiptCenterContainer}>
                <ReceiptContent />
                <View style={[styles.statusCard, { backgroundColor: "#d1fae5" }]}>
                  <Text style={styles.statusText}>✓ Transaksi Lunas</Text>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.actionButton, styles.finishButton, { borderColor: colors.border }]}
                onPress={() => router.back()}
              >
                <Check size={22} color={colors.text} />
                <Text style={[styles.buttonText, { color: colors.text }]}>Selesai</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.printButton, { backgroundColor: colors.primary }]}
                onPress={handleShareReceipt}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Receipt size={22} color="#fff" />
                    <Text style={[styles.buttonText, { color: "#fff" }]}>Cetak Struk</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Preview Struk</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Transaksi #{transaction.id}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <ReceiptContent />
        <View style={[styles.statusCard, { backgroundColor: "#d1fae5" }]}>
          <Text style={styles.statusText}>✓ Transaksi Lunas</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.finishButton, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Check size={22} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]}>Selesai</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.printButton, { backgroundColor: colors.primary }]}
          onPress={handleShareReceipt}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Receipt size={22} color="#fff" />
              <Text style={[styles.buttonText, { color: "#fff" }]}>Cetak Struk</Text>
            </>
          )}
        </TouchableOpacity>
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
  errorText: {
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  receiptCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  storeLogo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  storeName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  storeDescription: {
    fontSize: 13,
    marginBottom: 4,
    textAlign: "center",
  },
  storeAddress: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  storeContact: {
    fontSize: 11,
    textAlign: "center",
  },
  dividerLine: {
    height: 2,
    marginVertical: 16,
  },
  receiptHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },
  receiptId: {
    fontSize: 14,
    marginTop: 4,
  },
  infoSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 12,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalsSection: {
    paddingTop: 16,
    borderTopWidth: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  mainTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  mainTotalText: {
    fontSize: 18,
    fontWeight: "700",
  },
  receiptFooter: {
    alignItems: "center",
    marginTop: 16,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
  },
  statusCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  finishButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  printButton: {
    flex: 1.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  landscapeMaster: {
    flex: 1,
    flexDirection: "row",
  },
  landscapeContent: {
    flex: 1,
    flexDirection: "column",
  },
  landscapeScroll: {
    flex: 1,
  },
  landscapeScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  receiptCenterContainer: {
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },
});
