import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Clipboard,
  Animated,
} from "react-native";
import { X, Copy, Check, Clock, Eye, EyeOff, User, Calendar, Key } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { getPinHistory, revokePin, PinHistory } from "../../api/user";

interface PinHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

const PinHistoryModal: React.FC<PinHistoryModalProps> = ({
  visible,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [pins, setPins] = useState<PinHistory[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [copiedPin, setCopiedPin] = useState<number | null>(null);

  const translateY = useRef(new Animated.Value(1000)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in: fade in and slide up
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      loadPins(1, selectedStatus);
    } else {
      // Animate out: fade out and slide down
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 1000,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, selectedStatus]);

  const loadPins = async (pageNum: number, status?: string) => {
    if (pageNum === 1) {
      setLoading(true);
    }
    
    try {
      const response = await getPinHistory(pageNum, 10, status);
      if (response.success) {
        if (pageNum === 1) {
          setPins(response.data.pins);
        } else {
          setPins(prev => [...prev, ...response.data.pins]);
        }
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error loading PIN history:", error);
      Alert.alert("Error", "Failed to load PIN history");
    } finally {
      if (pageNum === 1) {
        setLoading(false);
      }
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPins(nextPage, selectedStatus);
    }
  };

  const handleStatusChange = (status?: string) => {
    setSelectedStatus(status);
    setPage(1);
    setPins([]);
    loadPins(1, status);
  };

  const handleRevoke = async (pinId: number) => {
    try {
      const response = await revokePin(pinId);
      if (response.success) {
        // Update the pin status in the list
        setPins(prev => prev.map(pin => 
          pin.id === pinId ? { ...pin, status: 'revoked', revokedAt: new Date().toISOString() } : pin
        ));
        Alert.alert("Success", response.message);
      }
    } catch (error: any) {
      console.error("Error revoking PIN:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to revoke PIN");
    }
  };

  const handleCopyPin = (pinCode: string, pinId: number) => {
    Clipboard.setString(pinCode);
    setCopiedPin(pinId);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'; // green
      case 'used': return '#8b5cf6'; // purple
      case 'expired': return '#f59e0b'; // amber
      case 'revoked': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'used': return 'Used';
      case 'expired': return 'Expired';
      case 'revoked': return 'Revoked';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderPinItem = ({ item }: { item: PinHistory }) => (
    <View style={[styles.pinItem, { backgroundColor: colors.card }]}>
      <View style={styles.pinHeader}>
        <View style={styles.pinCodeContainer}>
          <Text style={styles.pinCode}>{item.code}</Text>
          <TouchableOpacity onPress={() => handleCopyPin(item.code, item.id)} style={styles.copyBtn}>
            {copiedPin === item.id ? (
              <Check size={16} color="#10b981" />
            ) : (
              <Copy size={16} color="#4ECDC4" />
            )}
          </TouchableOpacity>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.pinDetails}>
        <View style={styles.detailRow}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            Exp: {formatDate(item.expiresAt)}
          </Text>
        </View>
        
        {item.createdBy && (
          <View style={styles.detailRow}>
            <User size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              By: {item.createdBy}
            </Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
      
      {item.status === 'active' && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.revokeBtn}
            onPress={() => Alert.alert(
              "Revoke PIN",
              `Are you sure you want to revoke this PIN? This action cannot be undone.`,
              [
                { text: "Cancel", style: "cancel" },
                { text: "Revoke", style: "destructive", onPress: () => handleRevoke(item.id) }
              ]
            )}
          >
            <Key size={16} color="#ffffff" />
            <Text style={styles.revokeBtnText}>Revoke</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
              opacity
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>PIN History</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Status Filter */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterBtn,
                selectedStatus === undefined && styles.filterBtnActive
              ]}
              onPress={() => handleStatusChange(undefined)}
            >
              <Text style={[
                styles.filterText,
                selectedStatus === undefined && styles.filterTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterBtn,
                selectedStatus === 'active' && styles.filterBtnActive
              ]}
              onPress={() => handleStatusChange('active')}
            >
              <Text style={[
                styles.filterText,
                selectedStatus === 'active' && styles.filterTextActive
              ]}>
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterBtn,
                selectedStatus === 'used' && styles.filterBtnActive
              ]}
              onPress={() => handleStatusChange('used')}
            >
              <Text style={[
                styles.filterText,
                selectedStatus === 'used' && styles.filterTextActive
              ]}>
                Used
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterBtn,
                selectedStatus === 'expired' && styles.filterBtnActive
              ]}
              onPress={() => handleStatusChange('expired')}
            >
              <Text style={[
                styles.filterText,
                selectedStatus === 'expired' && styles.filterTextActive
              ]}>
                Expired
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {loading && pins.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading PINs...</Text>
              </View>
            ) : pins.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Key size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.text }]}>No PINs found</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Generate PINs to see history here</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={pins}
                  renderItem={renderPinItem}
                  keyExtractor={(item) => item.id.toString()}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.1}
                  showsVerticalScrollIndicator={false}
                />
                
                {loading && pins.length > 0 && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                )}
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any, theme: string) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 0,
  },
  modalContainer: {
    backgroundColor: theme === "dark" ? "#2D2D2D" : colors.surface,
    borderRadius: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: "100%",
    maxHeight: "80%",
    marginLeft: "auto",
    marginRight: "auto",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  filterBtnActive: {
    backgroundColor: colors.primary + "20",
  },
  filterText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  pinItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  pinHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pinCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  pinCode: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 2,
    flex: 1,
  },
  copyBtn: {
    padding: 4,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  pinDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 8,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  revokeBtn: {
    flexDirection: "row",
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    gap: 6,
  },
  revokeBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
});

export default PinHistoryModal;