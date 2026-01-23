import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Platform,
} from "react-native";
import { X, Calendar, User, Filter } from "lucide-react-native";
import { useTheme } from "../../../context/ThemeContext";
import { getAllUsers, User as UserType } from "../../../api/admin";

interface FilterParams {
    start_date?: string;
    end_date?: string;
    cashier_id?: number;
    status?: 'DRAFT' | 'COMPLETED' | 'LOCKED' | 'ALL';
}

interface TransactionFilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApplyFilter: (filters: FilterParams) => void;
    currentFilters: FilterParams;
}

const TransactionFilterModal: React.FC<TransactionFilterModalProps> = ({
    visible,
    onClose,
    onApplyFilter,
    currentFilters,
}) => {
    const { colors } = useTheme();

    const [startDate, setStartDate] = useState<string>(currentFilters.start_date || "");
    const [endDate, setEndDate] = useState<string>(currentFilters.end_date || "");
    const [selectedCashier, setSelectedCashier] = useState<number | undefined>(currentFilters.cashier_id);
    const [selectedStatus, setSelectedStatus] = useState<'DRAFT' | 'COMPLETED' | 'LOCKED' | 'ALL'>(currentFilters.status || 'ALL');
    const [cashiers, setCashiers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            loadCashiers();
            setStartDate(currentFilters.start_date || "");
            setEndDate(currentFilters.end_date || "");
            setSelectedCashier(currentFilters.cashier_id);
            setSelectedStatus(currentFilters.status || 'ALL');
        }
    }, [visible, currentFilters]);

    const loadCashiers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsers('CASHIER', 1, 100);
            if (response.success && response.data) {
                setCashiers(response.data.users);
            }
        } catch (error) {
            console.error("Error loading cashiers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        const filters: FilterParams = {};

        if (startDate) filters.start_date = startDate;
        if (endDate) filters.end_date = endDate;
        if (selectedCashier) filters.cashier_id = selectedCashier;
        if (selectedStatus && selectedStatus !== 'ALL') filters.status = selectedStatus;

        onApplyFilter(filters);
        onClose();
    };

    const handleReset = () => {
        setStartDate("");
        setEndDate("");
        setSelectedCashier(undefined);
        setSelectedStatus('ALL');
        onApplyFilter({});
        onClose();
    };

    const statusOptions: Array<{ label: string; value: 'DRAFT' | 'COMPLETED' | 'LOCKED' | 'ALL' }> = [
        { label: "Semua Status", value: 'ALL' },
        { label: "Draft", value: 'DRAFT' },
        { label: "Selesai", value: 'COMPLETED' },
        { label: "Terkunci", value: 'LOCKED' },
    ];

    const getQuickDateRange = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
        };
    };

    const handleQuickDate = (days: number) => {
        const range = getQuickDateRange(days);
        setStartDate(range.start);
        setEndDate(range.end);
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.modalHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Filter size={20} color={colors.primary} />
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                Filter Transaksi
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <Calendar size={16} color={colors.textSecondary} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Rentang Tanggal
                                </Text>
                            </View>

                            <View style={styles.quickDateButtons}>
                                <TouchableOpacity
                                    style={[styles.quickDateBtn, { backgroundColor: colors.surface }]}
                                    onPress={() => handleQuickDate(7)}
                                >
                                    <Text style={[styles.quickDateText, { color: colors.textSecondary }]}>7 Hari</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.quickDateBtn, { backgroundColor: colors.surface }]}
                                    onPress={() => handleQuickDate(30)}
                                >
                                    <Text style={[styles.quickDateText, { color: colors.textSecondary }]}>30 Hari</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.quickDateBtn, { backgroundColor: colors.surface }]}
                                    onPress={() => handleQuickDate(90)}
                                >
                                    <Text style={[styles.quickDateText, { color: colors.textSecondary }]}>90 Hari</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dateInputsContainer}>
                                <View style={styles.dateInputWrapper}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Dari</Text>
                                    <TouchableOpacity
                                        style={[styles.dateInput, { borderColor: colors.border }]}
                                        onPress={() => { }}
                                    >
                                        <Text style={[styles.dateText, { color: startDate ? colors.text : colors.textSecondary }]}>
                                            {startDate || "Pilih tanggal"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.dateInputWrapper}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Sampai</Text>
                                    <TouchableOpacity
                                        style={[styles.dateInput, { borderColor: colors.border }]}
                                        onPress={() => { }}
                                    >
                                        <Text style={[styles.dateText, { color: endDate ? colors.text : colors.textSecondary }]}>
                                            {endDate || "Pilih tanggal"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <User size={16} color={colors.textSecondary} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Kasir
                                </Text>
                            </View>

                            <View style={styles.optionsContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.optionButton,
                                        { borderColor: colors.border },
                                        !selectedCashier && { backgroundColor: colors.primary + "20", borderColor: colors.primary }
                                    ]}
                                    onPress={() => setSelectedCashier(undefined)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        { color: colors.text },
                                        !selectedCashier && { color: colors.primary, fontWeight: '600' }
                                    ]}>
                                        Semua Kasir
                                    </Text>
                                </TouchableOpacity>

                                {cashiers.map((cashier) => (
                                    <TouchableOpacity
                                        key={cashier.user_id}
                                        style={[
                                            styles.optionButton,
                                            { borderColor: colors.border },
                                            selectedCashier === cashier.user_id && {
                                                backgroundColor: colors.primary + "20",
                                                borderColor: colors.primary
                                            }
                                        ]}
                                        onPress={() => setSelectedCashier(cashier.user_id)}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            { color: colors.text },
                                            selectedCashier === cashier.user_id && {
                                                color: colors.primary,
                                                fontWeight: '600'
                                            }
                                        ]}>
                                            {cashier.user_name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Status Transaksi
                            </Text>

                            <View style={styles.optionsContainer}>
                                {statusOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.optionButton,
                                            { borderColor: colors.border },
                                            selectedStatus === option.value && {
                                                backgroundColor: colors.primary + "20",
                                                borderColor: colors.primary
                                            }
                                        ]}
                                        onPress={() => setSelectedStatus(option.value)}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            { color: colors.text },
                                            selectedStatus === option.value && {
                                                color: colors.primary,
                                                fontWeight: '600'
                                            }
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            onPress={handleReset}
                            style={[styles.button, styles.resetButton]}
                        >
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleApply}
                            style={[
                                styles.button,
                                styles.submitButton,
                                { backgroundColor: colors.primary },
                            ]}
                        >
                            <Text style={styles.submitButtonText}>Terapkan Filter</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        maxWidth: 500,
        maxHeight: "85%",
        borderRadius: 16,
        padding: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        maxHeight: 450,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
    },
    quickDateButtons: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    quickDateBtn: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    quickDateText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dateInputsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    dateInputWrapper: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        marginBottom: 6,
    },
    dateInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    dateText: {
        fontSize: 14,
    },
    optionsContainer: {
        gap: 8,
        marginTop: 12,
    },
    optionButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    optionText: {
        fontSize: 14,
    },
    modalFooter: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    resetButton: {
        backgroundColor: "#334155",
    },
    resetButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    submitButton: {
        backgroundColor: "#4ECDC4",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default TransactionFilterModal;
