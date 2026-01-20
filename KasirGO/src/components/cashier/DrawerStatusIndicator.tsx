import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Wallet, AlertCircle, CheckCircle, XCircle } from "lucide-react-native";
import { getCurrentCashDrawer, CashDrawer, openCashDrawer } from "../../api/cashDrawer";
import { formatCurrency } from "../../utils/financial.helpers";
import { useTheme } from "../../context/ThemeContext";

interface DrawerStatusIndicatorProps {
    onOpenDrawer: () => void;
}

export default function DrawerStatusIndicator({ onOpenDrawer }: DrawerStatusIndicatorProps) {
    const { colors } = useTheme();
    const [drawer, setDrawer] = useState<CashDrawer | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasDrawer, setHasDrawer] = useState(false);
    const [opening, setOpening] = useState(false);

    useEffect(() => {
        checkDrawerStatus();
    }, []);

    const checkDrawerStatus = async () => {
        try {
            setLoading(true);
            const response = await getCurrentCashDrawer();
            if (response.success && response.data) {
                setDrawer(response.data);
                setHasDrawer(true);
            } else {
                setHasDrawer(false);
            }
        } catch (error) {
            setHasDrawer(false);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenShift = async () => {
        try {
            setOpening(true);
            await openCashDrawer(0);
            await checkDrawerStatus();
        } catch (error: any) {
            console.error('Error opening shift:', error);
            alert(error.response?.data?.message || 'Gagal membuka shift');
        } finally {
            setOpening(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.card }]}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }

    if (!hasDrawer) {
        return (
            <View style={[styles.container, styles.warningContainer, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
                <AlertCircle size={20} color="#F59E0B" />
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: "#92400E" }]}>Shift  Belum Dibuka</Text>
                    <Text style={[styles.subtitle, { color: "#92400E" }]}>Buka shift untuk mulai transaksi</Text>
                </View>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#F59E0B" }]}
                    onPress={handleOpenShift}
                    disabled={opening}
                >
                    {opening ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={styles.actionButtonText}>Buka Shift</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    const expectedBalance = drawer
        ? parseFloat(drawer.opening_balance.toString()) +
        parseFloat(drawer.cash_in_transactions.toString()) -
        parseFloat(drawer.cash_out_refunds.toString())
        : 0;

    return (
        <View style={[styles.container, styles.successContainer, { backgroundColor: "#ECFDF5", borderColor: "#10B981" }]}>
            <CheckCircle size={20} color="#10B981" />
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: "#064E3B" }]}>Shift Aktif</Text>
                <Text style={[styles.subtitle, { color: "#064E3B" }]}>
                    Cash: {formatCurrency(expectedBalance)}
                </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: "#10B981" }]}>
                <Text style={styles.statusText}>OPEN</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginVertical: 12,
        padding: 16,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
    },
    warningContainer: {
        // Additional styling for warning state
    },
    successContainer: {
        // Additional styling for success state
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    actionButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "700",
    },
});
