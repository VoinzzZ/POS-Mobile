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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Download, Share2, X, FileText, Store as StoreIcon } from "lucide-react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { transactionService, Transaction } from "../../../src/api/transaction";
import { getStoreSettings, Store } from "../../../src/api/store";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";

export default function AdminReceiptPreviewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [storeData, setStoreData] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const receiptRef = useRef<View>(null);

  useEffect(() => {
    loadTransactionData();
  }, []);

  const loadTransactionData = async () => {
    try {
      setLoading(true);
      // Admin menggunakan getTransactionDetail karena bisa akses semua transaksi
      // Load both transaction and store data in parallel
      const [transactionResponse, storeResponse] = await Promise.all([
        transactionService.getTransactionDetail(Number(id)),
        getStoreSettings(),
      ]);
      
      if (transactionResponse.success && transactionResponse.data) {
        setTransaction(transactionResponse.data);
        if (storeResponse.success && storeResponse.data) {
          setStoreData(storeResponse.data);
        }
        // Generate image automatically after component renders
        setTimeout(() => generateImage(), 500);
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

  const generateReceiptHTML_OLD = (transaction: Transaction, store: Store | null): string => {
    const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const itemsHTML = transaction.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            ${item.product.name}<br/>
            <span style="color: #6b7280; font-size: 12px;">
              ${item.quantity} x ${formatCurrency(item.price)}
            </span>
          </td>
          <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #e5e7eb;">
            ${formatCurrency(item.subtotal)}
          </td>
        </tr>
      `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Struk #${transaction.id}</title>
        <style>
          @page {
            size: 108mm auto;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            background: white;
            margin: 0;
            padding: 0;
            width: 108mm;
          }
          .receipt {
            width: 100%;
            background: white;
            padding: 6mm;
            margin: 0;
            border: 1px solid #e5e7eb;
            box-sizing: border-box;
          }
          .header {
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px dashed #d1d5db;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 12px;
            display: block;
          }
          .store-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #1f2937;
          }
          .store-description {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .store-address {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .store-contact {
            font-size: 11px;
            color: #9ca3af;
            margin-top: 4px;
          }
          .transaction-id {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .date {
            font-size: 12px;
            color: #9ca3af;
          }
          .info-section {
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .info-label {
            color: #6b7280;
          }
          .info-value {
            color: #1f2937;
            font-weight: 500;
          }
          .items-section {
            margin-bottom: 16px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #1f2937;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td {
            font-size: 14px;
            color: #1f2937;
          }
          .totals {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 2px solid #e5e7eb;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .total-row.main {
            font-size: 18px;
            font-weight: bold;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px dashed #d1d5db;
          }
          .total-label {
            color: #6b7280;
          }
          .total-value {
            color: #1f2937;
            font-weight: 600;
          }
          .total-row.main .total-label,
          .total-row.main .total-value {
            color: #059669;
          }
          .footer {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 2px dashed #d1d5db;
            text-align: center;
          }
          .footer-text {
            font-size: 12px;
            color: #9ca3af;
            margin-bottom: 4px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            background: #d1fae5;
            color: #059669;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            ${store?.logoUrl ? `<img src="${store.logoUrl}" class="logo" alt="Store Logo" />` : ""}
            <div class="store-name">${store?.name || "KasirGO"}</div>
            ${store?.description ? `<div class="store-description">${store.description}</div>` : ""}
            ${store?.address ? `<div class="store-address">${store.address}</div>` : ""}
            ${store?.phone || store?.email ? `<div class="store-contact">${store?.phone ? `Telp: ${store.phone}` : ""}${store?.phone && store?.email ? " | " : ""}${store?.email ? `Email: ${store.email}` : ""}</div>` : ""}
            <div class="transaction-id" style="margin-top: 12px;">Transaksi #${transaction.id}</div>
            <div class="date">${formatDate(transaction.createdAt)}</div>
            <div class="status-badge">✓ LUNAS</div>
          </div>

          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Kasir:</span>
              <span class="info-value">${transaction.cashier?.userName || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Item:</span>
              <span class="info-value">${transaction.items.length} item</span>
            </div>
          </div>

          <div class="items-section">
            <div class="section-title">Detail Pembelian</div>
            <table>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          <div class="totals">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">${formatCurrency(transaction.total)}</span>
            </div>
            <div class="total-row main">
              <span class="total-label">TOTAL:</span>
              <span class="total-value">${formatCurrency(transaction.total)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Metode:</span>
              <span class="total-value">${transaction.paymentMethod === 'CASH' ? '💵 Tunai' : transaction.paymentMethod === 'QRIS' ? '📱 QRIS' : '💳 Debit'}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Bayar:</span>
              <span class="total-value">${formatCurrency(transaction.paymentAmount || 0)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Kembalian:</span>
              <span class="total-value">${formatCurrency(transaction.changeAmount || 0)}</span>
            </div>
          </div>

          <div class="footer">
            <div class="footer-text">Terima kasih atas kunjungan Anda!</div>
            <div class="footer-text">made by KasirGo - @VoinzzZ</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownload = async () => {
    if (!imageUri || !transaction) {
      Alert.alert("Error", "Struk belum siap");
      return;
    }

    try {
      setGenerating(true);
      
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Izin akses galeri diperlukan untuk menyimpan struk");
        return;
      }

      const fileName = `struk_${transaction.id}_${Date.now()}.png`;
      const downloadPath = `${FileSystem.documentDirectory}${fileName}`;

      // Copy file to document directory
      await FileSystem.copyAsync({
        from: imageUri,
        to: downloadPath,
      });

      // Save to media library (gallery)
      const asset = await MediaLibrary.createAssetAsync(downloadPath);
      await MediaLibrary.createAlbumAsync("KasirGO", asset, false);

      Alert.alert(
        "Berhasil",
        `Struk berhasil disimpan ke Galeri!\n\nFolder: KasirGO`,
        [
          {
            text: "Share",
            onPress: () => handleShare(),
          },
          {
            text: "OK",
          },
        ]
      );
    } catch (error) {
      console.error("Error downloading image:", error);
      Alert.alert("Error", "Gagal menyimpan struk");
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!imageUri) {
      Alert.alert("Error", "Struk belum siap");
      return;
    }

    try {
      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        await Sharing.shareAsync(imageUri, {
          mimeType: "image/png",
          dialogTitle: "Bagikan Struk",
        });
      } else {
        Alert.alert("Error", "Sharing tidak tersedia di perangkat ini");
      }
    } catch (error) {
      console.error("Error sharing image:", error);
      Alert.alert("Error", "Gagal share struk");
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={[styles.title, { color: colors.text }]}>Preview Struk</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Transaksi #{transaction.id}
          </Text>
        </View>
      </View>

      {/* Preview Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Receipt Card Preview - This will be captured as PNG */}
        <View 
          ref={receiptRef}
          style={[styles.receiptCard, { backgroundColor: colors.surface }]}
          collapsable={false}
        >
          {/* Store Header */}
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

          {/* Transaction Info */}
          <View style={styles.transactionInfo}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                No. Transaksi
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                #{transaction.id}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Tanggal
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {new Date(transaction.createdAt).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Kasir
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {transaction.cashier?.userName || "N/A"}
              </Text>
            </View>
          </View>

          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

          {/* Items */}
          <View style={styles.itemsSection}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemHeaderText, { color: colors.text }]}>Item</Text>
              <Text style={[styles.itemHeaderText, { color: colors.text }]}>Qty</Text>
              <Text style={[styles.itemHeaderText, { color: colors.text }]}>Harga</Text>
              <Text style={[styles.itemHeaderText, { color: colors.text }]}>Subtotal</Text>
            </View>
            {transaction.items.map((item) => (
              <View key={item.id} style={styles.item}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {item.product.name}
                </Text>
                <Text style={[styles.itemQty, { color: colors.text }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.itemPrice, { color: colors.text }]}>
                  {formatCurrency(item.price)}
                </Text>
                <Text style={[styles.itemSubtotal, { color: colors.text }]}>
                  {formatCurrency(item.subtotal)}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

          {/* Total */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                TOTAL
              </Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                {formatCurrency(transaction.total)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>
                Bayar
              </Text>
              <Text style={[styles.paymentValue, { color: colors.textSecondary }]}>
                {formatCurrency(transaction.paymentAmount || 0)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>
                Kembali
              </Text>
              <Text style={[styles.paymentValue, { color: colors.textSecondary }]}>
                {formatCurrency(transaction.changeAmount || 0)}
              </Text>
            </View>
          </View>

          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />

          {/* Footer */}
          <View style={styles.receiptFooter}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Terima kasih atas kunjungan Anda!
            </Text>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Made by KasirGo - @VoinzzZ
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          disabled={generating || !imageUri}
        >
          <Share2 size={20} color="#3b82f6" />
          <Text style={[styles.buttonText, { color: "#3b82f6" }]}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleDownload}
          disabled={generating || !imageUri}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Download size={20} color="#fff" />
              <Text style={[styles.buttonText, { color: "#fff" }]}>Simpan ke Galeri</Text>
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
  transactionInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  itemsSection: {
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#64748b",
  },
  itemHeaderText: {
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  item: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 11,
    flex: 2,
  },
  itemQty: {
    fontSize: 11,
    flex: 0.5,
    textAlign: "center",
  },
  itemPrice: {
    fontSize: 11,
    flex: 1,
    textAlign: "right",
  },
  itemSubtotal: {
    fontSize: 11,
    flex: 1,
    textAlign: "right",
    fontWeight: "600",
  },
  totalsSection: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
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
    fontSize: 12,
  },
  paymentValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  receiptFooter: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 4,
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
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  shareButton: {
    backgroundColor: "#dbeafe",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});