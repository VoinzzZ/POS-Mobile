import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { Star, TrendingUp } from "lucide-react-native";
import { getEmployeePerformance, EmployeePerformance } from "../../api/financial";
import { formatCurrency } from "../../utils/financial.helpers";
import { useTheme } from "../../context/ThemeContext";

export default function EmployeePerformanceList() {
    const { colors } = useTheme();
    const [performance, setPerformance] = useState<EmployeePerformance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPerformance();
    }, []);

    const fetchPerformance = async () => {
        try {
            setLoading(true);
            const response = await getEmployeePerformance({ limit: 5 });
            if (response.success && response.data) {
                setPerformance(response.data);
            }
        } catch (err) {
            console.error("Error fetching employee performance:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent, { backgroundColor: colors.card }]}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }

    if (performance.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Karyawan Terbaik
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Belum ada data transaksi
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Karyawan Terbaik
            </Text>
            {performance.map((employee, index) => (
                <View
                    key={employee.userId}
                    style={[
                        styles.employeeItem,
                        {
                            borderBottomColor: colors.border,
                            borderBottomWidth: index < performance.length - 1 ? 1 : 0,
                        },
                    ]}
                >
                    <View style={styles.rankBadge}>
                        {index === 0 && <Star size={16} color="#FFD700" fill="#FFD700" />}
                        {(index === 1 || index === 2) && (
                            <Text style={[styles.rankText, { color: colors.textSecondary }]}>
                                #{index + 1}
                            </Text>
                        )}
                        {index > 2 && (
                            <Text style={[styles.rankText, { color: colors.textSecondary }]}>
                                #{index + 1}
                            </Text>
                        )}
                    </View>
                    <View style={styles.employeeInfo}>
                        <Text style={[styles.employeeName, { color: colors.text }]}>
                            {employee.name}
                        </Text>
                        <Text style={[styles.employeeStats, { color: colors.textSecondary }]}>
                            {employee.transactions} transaksi • {formatCurrency(employee.revenue)}
                        </Text>
                    </View>
                    <View style={[styles.averageBadge, { backgroundColor: `${colors.primary}15` }]}>
                        <TrendingUp size={14} color={colors.primary} />
                        <Text style={[styles.averageText, { color: colors.primary }]}>
                            {formatCurrency(employee.averageTransaction)}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
    },
    centerContent: {
        paddingVertical: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        textAlign: "center",
    },
    employeeItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        gap: 12,
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    rankText: {
        fontSize: 14,
        fontWeight: "600",
    },
    employeeInfo: {
        flex: 1,
    },
    employeeName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    employeeStats: {
        fontSize: 13,
    },
    averageBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    averageText: {
        fontSize: 12,
        fontWeight: "700",
    },
});
