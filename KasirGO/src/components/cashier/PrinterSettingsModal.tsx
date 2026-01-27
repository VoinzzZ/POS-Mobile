import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import { X, Bluetooth, RefreshCw, Check, Printer } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import thermalPrinterService, { BluetoothDevice } from '../../services/thermalPrinterService';

interface PrinterSettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function PrinterSettingsModal({ visible, onClose }: PrinterSettingsModalProps) {
    const { colors } = useTheme();
    const [devices, setDevices] = useState<BluetoothDevice[]>([]);
    const [scanning, setScanning] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
    const [paperWidth, setPaperWidth] = useState<58 | 80>(58);

    useEffect(() => {
        if (visible) {
            loadInitialData();
        }
    }, [visible]);

    const requestBluetoothPermissions = async (): Promise<boolean> => {
        if (Platform.OS !== 'android') {
            return true;
        }

        try {
            if (Platform.Version >= 31) {
                // Android 12+ (API 31+) needs runtime permissions
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);

                const allGranted = Object.values(granted).every(
                    (result) => result === PermissionsAndroid.RESULTS.GRANTED
                );

                if (!allGranted) {
                    Alert.alert(
                        'Permission Required',
                        'Bluetooth permissions are required to scan and connect to printers. Please grant all permissions.'
                    );
                    return false;
                }
            } else {
                // Android 11 and below
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert(
                        'Permission Required',
                        'Location permission is required to scan Bluetooth devices.'
                    );
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Error requesting permissions:', error);
            return false;
        }
    };

    const loadCurrentDevice = () => {
        const device = thermalPrinterService.getCurrentDevice();
        setConnectedDevice(device);
        const config = thermalPrinterService.getConfig();
        setPaperWidth(config.paperWidth);
    };

    const handleScan = async () => {
        if (Platform.OS !== 'android') {
            Alert.alert('Not Supported', 'Thermal printer hanya support di Android');
            return;
        }

        try {
            // Request permissions first
            const hasPermissions = await requestBluetoothPermissions();
            if (!hasPermissions) {
                return;
            }

            setScanning(true);
            setDevices([]);

            // Initialize (just loads last printer, doesn't check Bluetooth)
            await thermalPrinterService.initialize();

            // Scan for devices - this is where Bluetooth will be used
            const scannedDevices = await thermalPrinterService.scanDevices();
            setDevices(scannedDevices);

            if (scannedDevices.length === 0) {
                Alert.alert(
                    'No Devices Found',
                    'No Bluetooth devices found. Make sure your printer is ON and paired in Bluetooth settings.'
                );
            }
        } catch (error: any) {
            console.error('Scan error:', error);
            Alert.alert(
                'Scan Error',
                `Failed to scan: ${error.message || 'Unknown error'}. Make sure Bluetooth is enabled and printer is paired.`
            );
        } finally {
            setScanning(false);
        }
    };

    const loadInitialData = async () => {
        loadCurrentDevice();
        await handleScan();
    };

    const handleConnect = async (device: BluetoothDevice) => {
        try {
            // Request permissions first
            const hasPermissions = await requestBluetoothPermissions();
            if (!hasPermissions) {
                return;
            }

            setConnecting(true);
            const success = await thermalPrinterService.connect(device);

            if (success) {
                setConnectedDevice(device);
                // Status visible in UI, no alert needed
            } else {
                Alert.alert('Gagal', 'Tidak dapat terhubung ke printer');
            }
        } catch (error: any) {
            console.error('Connect error:', error);
            Alert.alert('Connection Error', error.message || 'Gagal terhubung ke printer');
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await thermalPrinterService.disconnect();
            setConnectedDevice(null);
            // Status visible in UI, no alert needed
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    };



    const handleTestPrint = async () => {
        if (!connectedDevice) {
            Alert.alert('Error', 'Tidak ada printer yang terhubung');
            return;
        }

        try {
            const success = await thermalPrinterService.testPrint();
            if (success) {
                Alert.alert('Berhasil', 'Test print berhasil!');
            } else {
                Alert.alert('Gagal', 'Test print gagal');
            }
        } catch (error) {
            console.error('Test print failed:', error);
            Alert.alert('Error', 'Gagal melakukan test print');
        }
    };

    const handlePaperWidthChange = (width: 58 | 80) => {
        setPaperWidth(width);
        thermalPrinterService.setConfig({ paperWidth: width });
    };

    const renderDevice = ({ item }: { item: BluetoothDevice }) => {
        const isConnected = connectedDevice?.address === item.address;

        return (
            <TouchableOpacity
                style={[
                    styles.deviceItem,
                    { backgroundColor: colors.card },
                    isConnected && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => !isConnected && handleConnect(item)}
                disabled={connecting || isConnected}
            >
                <View style={styles.deviceInfo}>
                    <Bluetooth size={24} color={isConnected ? colors.primary : colors.text} />
                    <View style={styles.deviceText}>
                        <Text style={[styles.deviceName, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.deviceAddress, { color: colors.textSecondary }]}>
                            {item.address}
                        </Text>
                    </View>
                </View>
                {isConnected && (
                    <View style={[styles.connectedBadge, { backgroundColor: colors.primary }]}>
                        <Check size={16} color="#fff" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <View style={styles.headerLeft}>
                            <Printer size={24} color={colors.primary} />
                            <Text style={[styles.title, { color: colors.text }]}>Pengaturan Printer</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Connection Status */}
                    {connectedDevice && (
                        <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
                            <View style={styles.statusInfo}>
                                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                                <View>
                                    <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                                        Terhubung ke
                                    </Text>
                                    <Text style={[styles.statusDevice, { color: colors.text }]}>
                                        {connectedDevice.name}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={handleDisconnect}
                                style={[styles.disconnectButton, { backgroundColor: colors.error }]}
                            >
                                <Text style={styles.disconnectText}>Putuskan</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Paper Width Selection */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ukuran Kertas</Text>
                        <View style={styles.paperWidthContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.paperWidthOption,
                                    { backgroundColor: colors.card },
                                    paperWidth === 58 && { backgroundColor: colors.primary },
                                ]}
                                onPress={() => handlePaperWidthChange(58)}
                            >
                                <Text
                                    style={[
                                        styles.paperWidthText,
                                        { color: colors.text },
                                        paperWidth === 58 && { color: '#fff' },
                                    ]}
                                >
                                    58mm
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.paperWidthOption,
                                    { backgroundColor: colors.card },
                                    paperWidth === 80 && { backgroundColor: colors.primary },
                                ]}
                                onPress={() => handlePaperWidthChange(80)}
                            >
                                <Text
                                    style={[
                                        styles.paperWidthText,
                                        { color: colors.text },
                                        paperWidth === 80 && { color: '#fff' },
                                    ]}
                                >
                                    80mm
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>



                    {/* Test Print Button */}
                    {connectedDevice && (
                        <TouchableOpacity
                            style={[styles.testButton, { backgroundColor: colors.primary }]}
                            onPress={handleTestPrint}
                        >
                            <Printer size={20} color="#fff" />
                            <Text style={styles.testButtonText}>Test Print</Text>
                        </TouchableOpacity>
                    )}

                    {/* Device List */}
                    <View style={styles.deviceSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Bluetooth Devices
                            </Text>
                            <TouchableOpacity onPress={handleScan} disabled={scanning}>
                                <RefreshCw
                                    size={20}
                                    color={colors.primary}
                                    style={scanning && styles.rotating}
                                />
                            </TouchableOpacity>
                        </View>

                        {scanning ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                    Scanning devices...
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={devices}
                                renderItem={renderDevice}
                                keyExtractor={(item) => item.address}
                                contentContainerStyle={styles.deviceListContent}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={true}
                                ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                        <Bluetooth size={48} color={colors.textSecondary} />
                                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                            Tidak ada device ditemukan
                                        </Text>
                                        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                            Pastikan Bluetooth printer sudah ON
                                        </Text>
                                    </View>
                                }
                            />
                        )}
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
        justifyContent: 'flex-end',
    },
    container: {
        height: '85%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    statusCard: {
        margin: 20,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusLabel: {
        fontSize: 12,
    },
    statusDevice: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 2,
    },
    disconnectButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    disconnectText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    paperWidthContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    paperWidthOption: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    paperWidthText: {
        fontSize: 16,
        fontWeight: '600',
    },

    testButton: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    testButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    deviceSection: {
        flex: 1,
        paddingHorizontal: 20,
    },
    deviceListContent: {
        paddingBottom: 20,
    },
    deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    deviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    deviceText: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
    },
    deviceAddress: {
        fontSize: 12,
        marginTop: 2,
    },
    connectedBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 4,
    },
    rotating: {
        transform: [{ rotate: '360deg' }],
    },
});
