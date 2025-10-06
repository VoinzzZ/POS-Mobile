import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, DollarSign } from 'lucide-react-native';
import { useTheme } from '../../../src/context/ThemeContext';
import { Transaction, transactionService } from '../../../src/api/transaction';

export default function TransactionScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'DEBIT'>('CASH');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTransactionDetail();
    }
  }, [id]);

  const fetchTransactionDetail = async () => {
    try {
      const response = await transactionService.getTransactionDetail(Number(id));
      if (response.success && response.data) {
        setTransaction(response.data);
        // Set default payment amount to total
        setPaymentAmount(response.data.total.toString());
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      Alert.alert('Error', 'Gagal memuat detail transaksi');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!transaction || !paymentAmount) {
      Alert.alert('Error', 'Silakan masukkan jumlah pembayaran');
      return;
    }

    const payment = parseFloat(paymentAmount);
    if (payment < transaction.total) {
      Alert.alert('Error', `Pembayaran kurang. Minimum: Rp ${transaction.total.toLocaleString('id-ID')}`);
      return;
    }

    setProcessing(true);
    try {
      const response = await transactionService.completePayment(transaction.id, payment, paymentMethod);
      if (response.success && response.data) {
        // Redirect langsung ke receipt preview
        router.replace(`/(cashier)/receipt/${response.data.id}`);
      }
    } catch (error: any) {
      console.error('Error completing payment:', error);
      const message = error.response?.data?.message || 'Gagal menyelesaikan pembayaran';
      Alert.alert('Error', message);
    } finally {
      setProcessing(false);
    }
  };


  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const calculateChange = () => {
    if (!transaction || !paymentAmount) return 0;
    const payment = parseFloat(paymentAmount) || 0;
    return Math.max(0, payment - transaction.total);
  };

  const getSmartPaymentSuggestions = (total: number): number[] => {
    // Pembulatan ke atas ribuan terdekat
    const roundedTotal = Math.ceil(total / 1000) * 1000;
    
    // Tentukan suggest berdasarkan range total
    if (total <= 10000) {
      return [10000, 50000, 100000];
    } else if (total <= 20000) {
      return [20000, 50000, 100000];
    } else if (total <= 50000) {
      return [50000, 100000, 150000];
    } else if (total <= 100000) {
      return [100000, 150000, 200000];
    } else if (total <= 150000) {
      return [150000, 200000, 500000];
    } else if (total <= 200000) {
      return [200000, 500000, 1000000];
    } else if (total <= 500000) {
      return [500000, 1000000, 2000000];
    } else {
      // Untuk total > 500rb, pakai pembulatan + kelipatan
      return [
        roundedTotal,
        roundedTotal + 500000,
        roundedTotal + 1000000
      ];
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Memuat transaksi...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Transaksi tidak ditemukan</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pembayaran</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content}>
        {/* Transaction Summary */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ringkasan Pesanan</Text>
          <Text style={[styles.transactionId, { color: colors.textSecondary }]}>
            Transaksi #{transaction.id}
          </Text>
          
          {transaction.items.map((item) => (
            <View key={item.id} style={[styles.orderItem, { borderBottomColor: colors.border }]}>
              <View style={styles.orderItemInfo}>
                <Text style={[styles.orderItemName, { color: colors.text }]}>
                  {item.product.name}
                </Text>
                <Text style={[styles.orderItemDetails, { color: colors.textSecondary }]}>
                  {formatCurrency(item.price)} × {item.quantity}
                </Text>
              </View>
              <Text style={[styles.orderItemTotal, { color: colors.text }]}>
                {formatCurrency(item.subtotal)}
              </Text>
            </View>
          ))}

          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              {formatCurrency(transaction.total)}
            </Text>
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Metode Pembayaran</Text>
          
          <View style={styles.paymentMethodContainer}>
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                { 
                  backgroundColor: paymentMethod === 'CASH' ? colors.primary : colors.card,
                  borderColor: paymentMethod === 'CASH' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setPaymentMethod('CASH')}
            >
              <Text style={[
                styles.paymentMethodText,
                { color: paymentMethod === 'CASH' ? '#fff' : colors.text }
              ]}>
                💵 Tunai
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                { 
                  backgroundColor: paymentMethod === 'QRIS' ? colors.primary : colors.card,
                  borderColor: paymentMethod === 'QRIS' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setPaymentMethod('QRIS')}
            >
              <Text style={[
                styles.paymentMethodText,
                { color: paymentMethod === 'QRIS' ? '#fff' : colors.text }
              ]}>
                📱 QRIS
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                { 
                  backgroundColor: paymentMethod === 'DEBIT' ? colors.primary : colors.card,
                  borderColor: paymentMethod === 'DEBIT' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setPaymentMethod('DEBIT')}
            >
              <Text style={[
                styles.paymentMethodText,
                { color: paymentMethod === 'DEBIT' ? '#fff' : colors.text }
              ]}>
                💳 Debit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Input */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Jumlah Pembayaran</Text>
          
          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <Text style={[styles.currencyPrefix, { color: colors.textSecondary }]}>Rp</Text>
            <TextInput
              style={[styles.paymentInput, { color: colors.text }]}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              placeholder="Masukkan jumlah pembayaran"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              selectTextOnFocus
            />
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmountContainer}>
            {getSmartPaymentSuggestions(transaction.total).map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[styles.quickAmountButton, { backgroundColor: colors.card }]}
                onPress={() => setPaymentAmount(amount.toString())}
              >
                <Text style={[styles.quickAmountText, { color: colors.text }]}>
                  {formatCurrency(amount)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Change Calculation */}
          {paymentAmount && (
            <View style={[styles.changeContainer, { borderColor: colors.border }]}>
              <View style={styles.changeRow}>
                <Text style={[styles.changeLabel, { color: colors.textSecondary }]}>Kembalian:</Text>
                <Text style={[styles.changeAmount, { color: colors.primary }]}>
                  {formatCurrency(calculateChange())}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Complete Payment Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            { backgroundColor: colors.primary },
            (!paymentAmount || processing) && styles.disabledButton
          ]}
          onPress={handleCompletePayment}
          disabled={!paymentAmount || processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <DollarSign size={24} color="#fff" />
              <Text style={styles.completeButtonText}>Selesaikan Pembayaran</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  transactionId: {
    fontSize: 14,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderItemDetails: {
    fontSize: 14,
  },
  orderItemTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  paymentInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 16,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  changeContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeLabel: {
    fontSize: 16,
  },
  changeAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentMethodButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 34,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
