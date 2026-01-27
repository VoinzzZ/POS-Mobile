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
  PixelRatio,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ReceiptText, Check, Store as StoreIcon, ArrowLeft, Printer } from "lucide-react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { useOrientation } from "../../../src/hooks/useOrientation";
import { transactionService, Transaction } from "../../../src/api/transaction";
import { getStoreSettings, Store } from "../../../src/api/store";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import CashierSidebar from "../../../src/components/navigation/CashierSidebar";
import thermalPrinterService from "../../../src/services/thermalPrinterService";
import ThermalReceiptFormatter from "../../../src/utils/thermalReceiptFormatter";

export default function ReceiptPreviewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { isLandscape, isTablet, dimensions } = useOrientation();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [storeData, setStoreData] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isViewReady, setIsViewReady] = useState(false);
  const receiptRef = useRef<View>(null);

  const showLandscape = (isLandscape && isTablet) ||
    (dimensions.width > dimensions.height && dimensions.width > 600);

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
    if (!receiptRef.current || !isViewReady) {
      Alert.alert("Error", "Struk belum siap untuk di-generate");
      return;
    }

    try {
      setGenerating(true);

      // Add delay to ensure view is fully rendered (especially important for emulator)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the receipt component as PNG
      const uri = await captureRef(receiptRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      console.log("✅ Image generated:", uri);
      setImageUri(uri);

      return uri;
    } catch (error: any) {
      console.error("Error generating image:", error);

      // Provide more helpful error messages
      const errorMessage = Platform.OS === 'android'
        ? "Gagal generate struk. Jika menggunakan emulator, coba di perangkat nyata."
        : "Gagal generate struk";

      Alert.alert("Error", errorMessage);
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

  const handleThermalPrint = async () => {
    if (!transaction || !storeData) {
      Alert.alert("Error", "Data transaksi belum siap");
      return;
    }

    try {
      setPrinting(true);

      const isConnected = await thermalPrinterService.isConnected();

      if (!isConnected) {
        Alert.alert(
          "Printer Tidak Terhubung",
          "Tidak ada printer thermal yang terhubung. Apakah Anda ingin membagikan struk dalam bentuk PDF?",
          [
            { text: "Batal", style: "cancel" },
            {
              text: "Share PDF",
              onPress: async () => {
                await handleShareReceipt();
              },
            },
          ]
        );
        return;
      }

      const config = thermalPrinterService.getConfig();
      const formatter = new ThermalReceiptFormatter(config.paperWidth);

      await formatter.printReceipt({
        transaction,
        companyName: storeData.name || 'KasirGO',
        companyDescription: storeData.description || '',
        companyAddress: storeData.address || '',
        companyPhone: storeData.phone || '',
        companyEmail: storeData.email || '',
        paperWidth: config.paperWidth,
      });
    } catch (error: any) {
      console.error("Error printing receipt:", error);
      Alert.alert(
        "Gagal Cetak",
        "Gagal mencetak ke printer thermal. Apakah Anda ingin membagikan struk dalam bentuk PDF?",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Share PDF",
            onPress: async () => {
              await handleShareReceipt();
            },
          },
        ]
      );
    } finally {
      setPrinting(false);
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
      style={[styles.receiptCard, { backgroundColor: '#FFFFFF' }]}
      collapsable={false}
      onLayout={() => setIsViewReady(true)}
    >
      <View style={styles.storeHeader}>
        {storeData?.logoUrl && (
          <Image
            source={{ uri: storeData.logoUrl }}
            style={styles.storeLogo}
            resizeMode="contain"
          />
        )}
        <Text style={[styles.storeName, { color: '#1f2937' }]}>
          {storeData?.name || "KasirGO"}
        </Text>
        {storeData?.description && (
          <Text style={[styles.storeDescription, { color: '#6b7280' }]}>
            {storeData.description}
          </Text>
        )}
        {storeData?.address && (
          <Text style={[styles.storeAddress, { color: '#6b7280' }]}>
            {storeData.address}
          </Text>
        )}
        {(storeData?.phone || storeData?.email) && (
          <Text style={[styles.storeContact, { color: '#6b7280' }]}>
            {storeData?.phone && `Telp: ${storeData.phone}`}
            {storeData?.phone && storeData?.email && " | "}
            {storeData?.email && `Email: ${storeData.email}`}
          </Text>
        )}
      </View>

      <View style={[styles.dividerLine, { backgroundColor: '#e5e7eb' }]} />

      <View style={styles.receiptHeader}>
        <Text style={[styles.receiptTitle, { color: '#1f2937' }]}>
          Transaksi
        </Text>
        <Text style={[styles.receiptId, { color: '#6b7280' }]}>
          #{transaction.dailyNumber || transaction.id}
        </Text>
      </View>

      <View style={[styles.infoSection, { borderTopColor: '#e5e7eb' }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: '#6b7280' }]}>
            Kasir:
          </Text>
          <Text style={[styles.infoValue, { color: '#1f2937' }]}>
            {transaction.cashier?.userName || "N/A"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: '#6b7280' }]}>
            Total Item:
          </Text>
          <Text style={[styles.infoValue, { color: '#1f2937' }]}>
            {transaction.items.length} item
          </Text>
        </View>
      </View>

      <View style={[styles.itemsSection, { borderTopColor: '#e5e7eb' }]}>
        <Text style={[styles.sectionTitle, { color: '#1f2937' }]}>
          Detail Pembelian
        </Text>
        {transaction.items.map((item) => (
          <View key={item.id} style={[styles.item, { borderBottomColor: '#e5e7eb' }]}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: '#1f2937' }]}>
                {item.product.name}
              </Text>
              <Text style={[styles.itemDetail, { color: '#6b7280' }]}>
                {item.quantity} x {formatCurrency(item.price)}
              </Text>
            </View>
            <Text style={[styles.itemTotal, { color: '#1f2937' }]}>
              {formatCurrency(item.subtotal)}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.totalsSection, { borderTopColor: '#e5e7eb' }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: '#6b7280' }]}>
            Subtotal:
          </Text>
          <Text style={[styles.totalValue, { color: '#1f2937' }]}>
            {formatCurrency(transaction.total)}
          </Text>
        </View>
        <View style={[styles.totalRow, styles.mainTotal]}>
          <Text style={[styles.totalLabel, styles.mainTotalText, { color: '#059669' }]}>
            TOTAL:
          </Text>
          <Text style={[styles.totalValue, styles.mainTotalText, { color: '#059669' }]}>
            {formatCurrency(transaction.total)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: '#6b7280' }]}>
            Metode:
          </Text>
          <Text style={[styles.totalValue, { color: '#1f2937' }]}>
            {transaction.paymentMethod === 'CASH' ? 'Tunai' :
              transaction.paymentMethod === 'QRIS' ? 'QRIS' : 'Debit'}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: '#6b7280' }]}>
            Bayar:
          </Text>
          <Text style={[styles.totalValue, { color: '#1f2937' }]}>
            {formatCurrency(transaction.paymentAmount || 0)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: '#6b7280' }]}>
            Kembalian:
          </Text>
          <Text style={[styles.totalValue, { color: '#1f2937' }]}>
            {formatCurrency(transaction.changeAmount || 0)}
          </Text>
        </View>
      </View>

      <View style={[styles.dividerLine, { backgroundColor: '#e5e7eb' }]} />

      <View style={styles.receiptFooter}>
        <Text style={[styles.footerText, { color: '#6b7280' }]}>
          Terima kasih atas kunjungan Anda!
        </Text>
        <Text style={[styles.footerText, { color: '#6b7280' }]}>
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
            <View style={[styles.landscapeHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color={colors.text} />
                <Text style={[styles.backButtonText, { color: colors.text }]}>Kembali</Text>
              </TouchableOpacity>
              <View style={styles.landscapeHeaderCenter}>
                <Text style={[styles.landscapeHeaderTitle, { color: colors.text }]}>Preview Struk</Text>
                <Text style={[styles.landscapeHeaderSubtitle, { color: colors.textSecondary }]}>
                  Transaksi #{transaction.dailyNumber || transaction.id}
                </Text>
              </View>
              <View style={{ width: 100 }} />
            </View>

            <View style={styles.landscapeTwoColumn}>
              {/* Left Column: Detailed Items Breakdown */}
              <ScrollView
                style={[styles.landscapeLeftColumn, { backgroundColor: colors.surface }]}
                contentContainerStyle={styles.landscapeLeftContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.detailsContainer}>
                  {/* Transaction Info Header */}
                  <View style={[styles.detailsHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.detailsTitle, { color: colors.text }]}>
                      Rincian Transaksi
                    </Text>
                    <View style={styles.detailsInfoRow}>
                      <Text style={[styles.detailsLabel, { color: colors.textSecondary }]}>
                        Kasir:
                      </Text>
                      <Text style={[styles.detailsValue, { color: colors.text }]}>
                        {transaction.cashier?.userName || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.detailsInfoRow}>
                      <Text style={[styles.detailsLabel, { color: colors.textSecondary }]}>
                        Waktu:
                      </Text>
                      <Text style={[styles.detailsValue, { color: colors.text }]}>
                        {new Date(transaction.createdAt).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* Items Table */}
                  <View style={styles.itemsTableContainer}>
                    {/* Table Header */}
                    <View style={[styles.tableHeader, { backgroundColor: colors.primary + '10', borderBottomColor: colors.border }]}>
                      <Text style={[styles.tableHeaderCell, styles.tableProductName, { color: colors.text }]}>
                        Nama Produk
                      </Text>
                      <Text style={[styles.tableHeaderCell, styles.tablePrice, { color: colors.text }]}>
                        Harga Satuan
                      </Text>
                      <Text style={[styles.tableHeaderCell, styles.tableQty, { color: colors.text }]}>
                        Jumlah
                      </Text>
                      <Text style={[styles.tableHeaderCell, styles.tableSubtotal, { color: colors.text }]}>
                        Subtotal
                      </Text>
                    </View>

                    {/* Table Rows */}
                    {transaction.items.map((item, index) => (
                      <View
                        key={item.id}
                        style={[
                          styles.tableRow,
                          { backgroundColor: index % 2 === 0 ? colors.background : colors.surface },
                          { borderBottomColor: colors.border }
                        ]}
                      >
                        <Text style={[styles.tableCell, styles.tableProductName, { color: colors.text }]}>
                          {item.product.name}
                        </Text>
                        <Text style={[styles.tableCell, styles.tablePrice, { color: colors.textSecondary }]}>
                          {formatCurrency(item.price)}
                        </Text>
                        <Text style={[styles.tableCell, styles.tableQty, { color: colors.text }]}>
                          {item.quantity}
                        </Text>
                        <Text style={[styles.tableCell, styles.tableSubtotal, { color: colors.text, fontWeight: '600' }]}>
                          {formatCurrency(item.subtotal)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Summary Section */}
                  <View style={[styles.summarySection, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                        Total Item:
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {transaction.items.length} item
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                        Subtotal:
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {formatCurrency(transaction.total)}
                      </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.summaryMainTotal, { borderTopColor: colors.border }]}>
                      <Text style={[styles.summaryLabel, styles.summaryMainTotalText, { color: colors.primary }]}>
                        TOTAL:
                      </Text>
                      <Text style={[styles.summaryValue, styles.summaryMainTotalText, { color: colors.primary }]}>
                        {formatCurrency(transaction.total)}
                      </Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                        Metode Pembayaran:
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {transaction.paymentMethod === 'CASH' ? 'Tunai' :
                          transaction.paymentMethod === 'QRIS' ? 'QRIS' : 'Debit'}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                        Jumlah Bayar:
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {formatCurrency(transaction.paymentAmount || 0)}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                        Kembalian:
                      </Text>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>
                        {formatCurrency(transaction.changeAmount || 0)}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Right Column: Receipt Preview */}
              <ScrollView
                style={styles.landscapeRightColumn}
                contentContainerStyle={styles.landscapeRightContent}
                showsVerticalScrollIndicator={false}
              >
                <ReceiptContent />
              </ScrollView>
            </View>

          </View>

          {/* Floating Print Button - Bottom Right */}
          <TouchableOpacity
            style={[styles.floatingPrintButton, { backgroundColor: colors.primary }]}
            onPress={handleThermalPrint}
            disabled={printing || generating}
          >
            {printing || generating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Printer size={22} color="#fff" />
                <Text style={styles.floatingButtonText}>Cetak</Text>
              </>
            )}
          </TouchableOpacity>
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
            Transaksi #{transaction.dailyNumber || transaction.id}
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
          onPress={handleThermalPrint}
          disabled={printing || generating}
        >
          {printing || generating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Printer size={22} color="#fff" />
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
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 450,  // Reduced from 600 to make it smaller
    alignSelf: "center",
    width: "100%",
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
    fontSize: 26,
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
    fontSize: 24,
    fontWeight: "700",
    marginTop: 12,
  },
  receiptId: {
    fontSize: 16,
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
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
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
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 13,
  },
  itemTotal: {
    fontSize: 15,
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
    fontSize: 15,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  mainTotalText: {
    fontSize: 20,
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
  landscapeTwoColumn: {
    flex: 1,
    flexDirection: "row",
  },
  // Left Column Styles
  landscapeLeftColumn: {
    flex: 5,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  landscapeLeftContent: {
    padding: 24,
  },
  detailsContainer: {
    flex: 1,
  },
  detailsHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  detailsInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailsLabel: {
    fontSize: 12,
  },
  detailsValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Items Table Styles
  itemsTableContainer: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 2,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
  },
  tableCell: {
    fontSize: 12,
  },
  tableProductName: {
    flex: 3,
  },
  tablePrice: {
    flex: 2,
    textAlign: "right",
  },
  tableQty: {
    flex: 1,
    textAlign: "center",
  },
  tableSubtotal: {
    flex: 2,
    textAlign: "right",
  },
  // Summary Section Styles
  summarySection: {
    padding: 12,
    borderTopWidth: 2,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryMainTotal: {
    marginTop: 6,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 2,
  },
  summaryMainTotalText: {
    fontSize: 16,
    fontWeight: "700",
  },
  summaryDivider: {
    height: 1,
    marginVertical: 8,
  },
  // Right Column Styles
  landscapeRightColumn: {
    flex: 5,
    backgroundColor: "#f3f4f6",
  },
  landscapeRightContent: {
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  // Landscape Footer Styles
  landscapeFooter: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  landscapeActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  landscapePrintButton: {
    marginBottom: 8,
  },
  landscapeFinishButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  landscapeButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  // New Landscape Header Styles
  landscapeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  landscapeHeaderCenter: {
    flex: 1,
    alignItems: "center",
  },
  landscapeHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  landscapeHeaderSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  // Floating Print Button
  floatingPrintButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  floatingButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
