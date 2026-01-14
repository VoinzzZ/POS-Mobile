import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { X, User, Mail, Shield, Clock, Calendar, CheckCircle, XCircle, Edit3 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { User as UserType, changeUserRole } from '../../api/user';
import { getRolesApi } from '../../api/auth';

interface Role {
    role_id: number;
    role_name: string;
    role_code: string;
}

interface UserDetailModalProps {
    visible: boolean;
    user: UserType | null;
    onClose: () => void;
    onUserUpdated?: () => void;
}

export default function UserDetailModal({ visible, user, onClose, onUserUpdated }: UserDetailModalProps) {
    const { colors } = useTheme();
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [error, setError] = useState('');
    const [editingRole, setEditingRole] = useState(false);
    const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);

    useEffect(() => {
        if (visible && user) {
            fetchRoles();
            setEditingRole(false);
            setError('');
        }
    }, [visible, user]);

    const fetchRoles = async () => {
        setLoadingRoles(true);
        try {
            const response = await getRolesApi();
            if (response.success && response.data) {
                const filteredRoles = response.data.roles.filter(
                    (role: Role) => role.role_code !== 'OWNER' && role.role_code !== 'SUPERADMIN'
                );
                setRoles(filteredRoles);

                const userRole = filteredRoles.find((role: Role) =>
                    role.role_code === (user?.role || user?.user_role)
                );
                if (userRole) {
                    setCurrentRoleId(userRole.role_id);
                    setSelectedRoleId(userRole.role_id);
                }
            }
        } catch (err: any) {
            console.error('Error fetching roles:', err);
        } finally {
            setLoadingRoles(false);
        }
    };

    const handleChangeRole = async () => {
        if (!user || !selectedRoleId || selectedRoleId === currentRoleId) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await changeUserRole(user.user_id || user.id, selectedRoleId);

            if (response.success) {
                setEditingRole(false);
                setCurrentRoleId(selectedRoleId);
                if (onUserUpdated) {
                    onUserUpdated();
                }
            } else {
                setError(response.message || 'Gagal mengubah role user');
            }
        } catch (err: any) {
            console.error('Error changing user role:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mengubah role');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRoleBadgeColor = (role: string) => {
        return role === 'ADMIN' ? '#ec4899' : '#3b82f6';
    };

    const currentRole = roles.find(r => r.role_id === currentRoleId);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <View style={styles.headerLeft}>
                            <User size={24} color={colors.primary} />
                            <Text style={[styles.title, { color: colors.text }]}>Detail Pengguna</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
                            <User size={48} color={colors.primary} />
                        </View>

                        <Text style={[styles.userName, { color: colors.text }]}>
                            {user.userName || user.user_name}
                        </Text>

                        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.infoRow}>
                                    <View style={styles.infoIcon}>
                                        <Shield size={20} color={colors.textSecondary} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Role</Text>
                                        {!editingRole && currentRole && (
                                            <View style={styles.roleDisplay}>
                                                <View style={[styles.badge, { backgroundColor: getRoleBadgeColor(currentRole.role_code) + '20' }]}>
                                                    <Text style={[styles.badgeText, { color: getRoleBadgeColor(currentRole.role_code) }]}>
                                                        {currentRole.role_code}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                {!editingRole && (
                                    <TouchableOpacity
                                        style={[styles.editButton, { backgroundColor: colors.primary + '20' }]}
                                        onPress={() => setEditingRole(true)}
                                    >
                                        <Edit3 size={16} color={colors.primary} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {editingRole && (
                                <View style={styles.roleEditSection}>
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
                                                            backgroundColor: selectedRoleId === role.role_id ? colors.primary + '20' : colors.card,
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

                                    <View style={styles.roleActions}>
                                        <TouchableOpacity
                                            style={[styles.roleActionBtn, styles.cancelBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                                            onPress={() => {
                                                setEditingRole(false);
                                                setSelectedRoleId(currentRoleId);
                                                setError('');
                                            }}
                                            disabled={loading}
                                        >
                                            <Text style={[styles.roleActionBtnText, { color: colors.text }]}>Batal</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.roleActionBtn, styles.saveBtn, { backgroundColor: colors.primary }]}
                                            onPress={handleChangeRole}
                                            disabled={loading || selectedRoleId === currentRoleId}
                                        >
                                            {loading ? (
                                                <ActivityIndicator size="small" color="#ffffff" />
                                            ) : (
                                                <Text style={styles.saveRoleBtnText}>Simpan</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {error && (
                                        <View style={[styles.errorContainer, { backgroundColor: '#ef4444' + '20' }]}>
                                            <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoIcon}>
                                    <Mail size={20} color={colors.textSecondary} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                        {user.userEmail || user.user_email}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoIcon}>
                                    {(user.isVerified || user.user_is_verified) ? (
                                        <CheckCircle size={20} color="#10b981" />
                                    ) : (
                                        <XCircle size={20} color="#f59e0b" />
                                    )}
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Status Verifikasi</Text>
                                    <Text style={[styles.infoValue, {
                                        color: (user.isVerified || user.user_is_verified) ? '#10b981' : '#f59e0b'
                                    }]}>
                                        {(user.isVerified || user.user_is_verified) ? 'Terverifikasi' : 'Belum Terverifikasi'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoIcon}>
                                    <Clock size={20} color={colors.textSecondary} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Login Terakhir</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                        {formatDate(user.user_last_login)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoIcon}>
                                    <Calendar size={20} color={colors.textSecondary} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Terdaftar Sejak</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                        {formatDate(user.createdAt || user.user_created_at)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ height: 20 }} />
                    </ScrollView>
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
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 24,
    },
    section: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        flex: 1,
    },
    infoIcon: {
        marginTop: 2,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    roleDisplay: {
        marginTop: 4,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    editButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleEditSection: {
        marginTop: 12,
    },
    loader: {
        marginVertical: 20,
    },
    roleList: {
        gap: 8,
        marginBottom: 12,
    },
    roleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        gap: 12,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    roleInfo: {
        flex: 1,
    },
    roleName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    roleCode: {
        fontSize: 11,
    },
    roleActions: {
        flexDirection: 'row',
        gap: 8,
    },
    roleActionBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        borderWidth: 1,
    },
    saveBtn: {
    },
    roleActionBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    saveRoleBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    errorContainer: {
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    errorText: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
});
