import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { X, XCircle, UserX } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { rejectEmployeeApi, RejectEmployeeData } from '../../api/auth';

interface Employee {
    user_id: number;
    user_name: string;
    user_email: string;
    user_full_name: string;
    user_phone?: string;
}

interface RejectEmployeeModalProps {
    visible: boolean;
    employee: Employee | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RejectEmployeeModal({ visible, employee, onClose, onSuccess }: RejectEmployeeModalProps) {
    const { colors } = useTheme();
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (visible) {
            setRejectionReason('');
            setError('');
        }
    }, [visible]);

    const handleReject = async () => {
        if (!employee) return;

        if (!rejectionReason.trim()) {
            setError('Alasan penolakan harus diisi');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data: RejectEmployeeData = {
                user_id: employee.user_id,
                rejection_reason: rejectionReason.trim(),
            };

            const response = await rejectEmployeeApi(data);

            if (response.success) {
                onSuccess();
                onClose();
            } else {
                setError(response.message || 'Gagal menolak employee');
            }
        } catch (err: any) {
            console.error('Error rejecting employee:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat menolak employee');
        } finally {
            setLoading(false);
        }
    };

    if (!employee) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <UserX size={24} color="#ef4444" />
                            <Text style={[styles.title, { color: colors.text }]}>Tolak Employee</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={[styles.employeeInfo, { backgroundColor: colors.background }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Informasi Employee</Text>
                            <Text style={[styles.employeeName, { color: colors.text }]}>{employee.user_full_name}</Text>
                            <Text style={[styles.employeeEmail, { color: colors.textSecondary }]}>{employee.user_email}</Text>
                            {employee.user_phone && (
                                <Text style={[styles.employeePhone, { color: colors.textSecondary }]}>{employee.user_phone}</Text>
                            )}
                        </View>

                        <View style={[styles.warningBox, { backgroundColor: '#ef4444' + '10', borderColor: '#ef4444' }]}>
                            <Text style={[styles.warningText, { color: '#ef4444' }]}>
                                Tindakan ini akan menolak pendaftaran employee dan mengirimkan email notifikasi penolakan.
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Alasan Penolakan *</Text>
                            <TextInput
                                style={[styles.reasonInput, {
                                    backgroundColor: colors.background,
                                    color: colors.text,
                                    borderColor: error && !rejectionReason.trim() ? '#ef4444' : colors.border
                                }]}
                                placeholder="Jelaskan alasan penolakan..."
                                placeholderTextColor={colors.textSecondary}
                                value={rejectionReason}
                                onChangeText={(text) => {
                                    setRejectionReason(text);
                                    if (error) setError('');
                                }}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                            />
                            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                                Alasan ini akan dikirimkan ke email employee
                            </Text>
                        </View>

                        {error ? (
                            <View style={[styles.errorContainer, { backgroundColor: '#ef4444' + '20' }]}>
                                <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
                            </View>
                        ) : null}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { backgroundColor: colors.background }]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={[styles.buttonText, { color: colors.text }]}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.rejectButton, { backgroundColor: '#ef4444' }]}
                            onPress={handleReject}
                            disabled={loading || !rejectionReason.trim()}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <>
                                    <XCircle size={20} color="#ffffff" />
                                    <Text style={styles.rejectButtonText}>Tolak</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 500,
        borderRadius: 20,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    employeeInfo: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    employeeName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    employeeEmail: {
        fontSize: 14,
        marginBottom: 2,
    },
    employeePhone: {
        fontSize: 14,
    },
    warningBox: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 20,
    },
    warningText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
    },
    reasonInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        minHeight: 120,
    },
    helperText: {
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
    errorContainer: {
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    rejectButton: {
        flexDirection: 'row',
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    rejectButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
});
