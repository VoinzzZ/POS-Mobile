import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { X, CheckCircle, UserCheck } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getRolesApi, approveEmployeeApi, ApproveEmployeeData } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

interface Role {
    role_id: number;
    role_name: string;
    role_code: string;
}

interface Employee {
    user_id: number;
    user_name: string;
    user_email: string;
    user_full_name: string;
    user_phone?: string;
}

interface ApproveEmployeeModalProps {
    visible: boolean;
    employee: Employee | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ApproveEmployeeModal({ visible, employee, onClose, onSuccess }: ApproveEmployeeModalProps) {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (visible) {
            fetchRoles();
            setSelectedRoleId(null);
            setNotes('');
            setError('');
        }
    }, [visible]);

    const fetchRoles = async () => {
        setLoadingRoles(true);
        try {
            const response = await getRolesApi();
            if (response.success && response.data) {
                const filteredRoles = response.data.roles.filter(
                    (role: Role) => role.role_code !== 'OWNER' && role.role_code !== 'SUPERADMIN'
                );
                setRoles(filteredRoles);
                if (filteredRoles.length > 0) {
                    setSelectedRoleId(filteredRoles[0].role_id);
                }
            }
        } catch (err: any) {
            console.error('Error fetching roles:', err);
            setError('Gagal memuat daftar role');
        } finally {
            setLoadingRoles(false);
        }
    };

    const handleApprove = async () => {
        if (!employee || !selectedRoleId) {
            setError('Pilih role terlebih dahulu');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data: ApproveEmployeeData = {
                user_id: employee.user_id,
                role_id: selectedRoleId,
                notes: notes.trim() || undefined,
            };

            const response = await approveEmployeeApi(data);

            if (response.success) {
                onSuccess();
                onClose();
            } else {
                setError(response.message || 'Gagal menyetujui employee');
            }
        } catch (err: any) {
            console.error('Error approving employee:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat menyetujui employee');
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
                            <UserCheck size={24} color={colors.primary} />
                            <Text style={[styles.title, { color: colors.text }]}>Setujui Employee</Text>
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

                        <View style={styles.section}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Pilih Role *</Text>
                            {loadingRoles ? (
                                <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
                            ) : (
                                <View style={styles.roleList}>
                                    {roles.map((role) => (
                                        <TouchableOpacity
                                            key={role.role_id}
                                            style={[
                                                styles.roleOption,
                                                {
                                                    backgroundColor: selectedRoleId === role.role_id ? colors.primary + '20' : colors.background,
                                                    borderColor: selectedRoleId === role.role_id ? colors.primary : colors.border
                                                }
                                            ]}
                                            onPress={() => setSelectedRoleId(role.role_id)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[
                                                styles.radioButton,
                                                { borderColor: selectedRoleId === role.role_id ? colors.primary : colors.border }
                                            ]}>
                                                {selectedRoleId === role.role_id && (
                                                    <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                                                )}
                                            </View>
                                            <View style={styles.roleInfo}>
                                                <Text style={[styles.roleName, { color: colors.text }]}>{role.role_name}</Text>
                                                <Text style={[styles.roleCode, { color: colors.textSecondary }]}>{role.role_code}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Catatan (Opsional)</Text>
                            <TextInput
                                style={[styles.notesInput, {
                                    backgroundColor: colors.background,
                                    color: colors.text,
                                    borderColor: colors.border
                                }]}
                                placeholder="Tambahkan catatan untuk employee..."
                                placeholderTextColor={colors.textSecondary}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
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
                            style={[styles.button, styles.approveButton, { backgroundColor: colors.primary }]}
                            onPress={handleApprove}
                            disabled={loading || !selectedRoleId}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <>
                                    <CheckCircle size={20} color="#ffffff" />
                                    <Text style={styles.approveButtonText}>Setujui</Text>
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
        marginBottom: 20,
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
    section: {
        marginBottom: 20,
    },
    loader: {
        marginVertical: 20,
    },
    roleList: {
        gap: 12,
    },
    roleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        gap: 12,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    roleInfo: {
        flex: 1,
    },
    roleName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    roleCode: {
        fontSize: 12,
    },
    notesInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        minHeight: 100,
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
    approveButton: {
        flexDirection: 'row',
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    approveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
});
