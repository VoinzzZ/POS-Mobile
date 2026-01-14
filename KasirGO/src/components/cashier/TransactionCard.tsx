import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Receipt, ChevronRight, Trash2 } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { Transaction } from "../../api/transaction";

interface TransactionCardProps {
    transaction: Transaction;
    onPress: () => void;
    onDelete: () => void;
    onPrintReceipt: () => void;
}

export default function TransactionCard({ transaction, onPress, onDelete, onPrintReceipt }: TransactionCardProps) {
    const { colors } = useTheme();

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return '#10b981';
            case 'DRAFT':
                return '#f59e0b';
            case 'LOCKED':
                return '#6b7280';
            default:
                return colors.textSecondary;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'Selesai';
            case 'DRAFT':
                return 'Draft';
            case 'LOCKED':
                return 'Terkunci';
            default:
                return status;
        }
    };

    return (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={onPress}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Receipt size={20} color={colors.primary} />
                    </View>
                    <View style={styles.info}>
                        <Text style={[styles.id, { color: colors.text }]}>
                            Transaksi #{transaction.id}
                        </Text>
                        <Text style={[styles.date, { color: colors.textSecondary }]}>
                            {formatDate(transaction.createdAt)}
                        </Text>
                    </View>
                    <ChevronRight size={20} color={colors.textSecondary} />
                </View>
            </TouchableOpacity>

            <View style={styles.details}>
                <View style={styles.row}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Total Item:</Text>
                    <Text style={[styles.value, { color: colors.text }]}>
                        {(transaction.items && Array.isArray(transaction.items) ? transaction.items.length : 0)} item
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Total:</Text>
                    <Text style={[styles.total, { color: colors.primary }]}>
                        {formatCurrency(transaction.total)}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(transaction.status)}20` }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                            {getStatusText(transaction.status)}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
                    onPress={onPrintReceipt}
                >
                    <Receipt size={16} color={colors.primary} />
                    <Text style={[styles.actionButtonText, { color: colors.primary }]}>Cetak Struk</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#ef444415' }]}
                    onPress={onDelete}
                >
                    <Trash2 size={16} color="#ef4444" />
                    <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Hapus</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3b82f620',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    id: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
    },
    details: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
    },
    total: {
        fontSize: 16,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
