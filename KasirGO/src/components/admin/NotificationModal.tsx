import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Image } from "react-native";
import { X } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { getLowStockNotifications, LowStockNotification } from "../../api/notification";

interface NotificationModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function NotificationModal({ visible, onClose }: NotificationModalProps) {
    const { colors } = useTheme();
    const [notifications, setNotifications] = useState<LowStockNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchNotifications();
        }
    }, [visible]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await getLowStockNotifications();
            if (response.success && response.data) {
                setNotifications(response.data);
            } else {
                setNotifications([]);
            }
        } catch (error: any) {
            console.error("Error fetching notifications:", error?.message || error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    const renderNotificationItem = ({ item }: { item: LowStockNotification }) => {
        const stockPercentage = item.product_min_stock > 0
            ? (item.product_qty / item.product_min_stock) * 100
            : 0;

        const getSeverityColor = () => {
            if (stockPercentage === 0) return "#ef4444";
            if (stockPercentage < 25) return "#ef4444";
            if (stockPercentage < 50) return "#f59e0b";
            return "#f97316";
        };

        return (
            <View style={[styles.notificationCard, { backgroundColor: colors.card, borderLeftColor: getSeverityColor() }]}>
                <View style={styles.cardContent}>
                    <View style={styles.productInfo}>
                        {item.product_image_url && (
                            <Image
                                source={{ uri: item.product_image_url }}
                                style={styles.productImage}
                            />
                        )}
                        <View style={styles.productDetails}>
                            <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
                                {item.product_name}
                            </Text>
                            {item.category && (
                                <Text style={[styles.categoryText, { color: colors.textSecondary }]} numberOfLines={1}>
                                    {item.category.category_name}
                                </Text>
                            )}
                            {item.product_sku && (
                                <Text style={[styles.skuText, { color: colors.textSecondary }]}>
                                    SKU: {item.product_sku}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.stockInfo}>
                        <Text style={[styles.currentStock, { color: getSeverityColor() }]}>
                            {item.product_qty}
                        </Text>
                        <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>
                            / {item.product_min_stock} min
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Tidak Ada Notifikasi</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Semua produk memiliki stok yang memadai
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                        <View>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Stok Rendah</Text>
                            {!loading && (
                                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                                    {notifications.length} produk
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                Memuat notifikasi...
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={notifications}
                            renderItem={renderNotificationItem}
                            keyExtractor={(item) => item.product_id.toString()}
                            contentContainerStyle={styles.listContainer}
                            ListEmptyComponent={renderEmpty}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={[colors.primary]}
                                    tintColor={colors.primary}
                                />
                            }
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        height: "85%",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    modalSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    closeButton: {
        padding: 8,
    },
    listContainer: {
        padding: 16,
    },
    notificationCard: {
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    productInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    categoryText: {
        fontSize: 12,
        marginBottom: 2,
    },
    skuText: {
        fontSize: 11,
        opacity: 0.7,
    },
    stockInfo: {
        alignItems: "flex-end",
    },
    currentStock: {
        fontSize: 24,
        fontWeight: "700",
    },
    stockLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 14,
        marginTop: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: "center",
    },
});
