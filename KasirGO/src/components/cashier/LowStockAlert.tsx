import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AlertCircle } from "lucide-react-native";

interface LowStockAlertProps {
    lowStockCount: number;
}

export default function LowStockAlert({ lowStockCount }: LowStockAlertProps) {
    if (lowStockCount === 0) return null;

    return (
        <View style={styles.container}>
            <AlertCircle size={20} color="#f59e0b" />
            <View style={styles.content}>
                <Text style={styles.title}>Low Stock Alert</Text>
                <Text style={styles.text}>
                    {lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "#78350f",
        marginHorizontal: 20,
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#f59e0b",
        gap: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fbbf24",
        marginBottom: 4,
    },
    text: {
        fontSize: 12,
        color: "#fde68a",
    },
});
