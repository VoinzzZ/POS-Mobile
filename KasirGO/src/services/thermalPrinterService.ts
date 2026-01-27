import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// @ts-ignore - Library doesn't have official TypeScript definitions
import { BluetoothEscposPrinter, BluetoothManager } from '@vardrz/react-native-bluetooth-escpos-printer';

const STORAGE_KEY = '@kasirgo_last_printer';

export interface BluetoothDevice {
    address: string;
    name: string;
}

export interface PrinterConfig {
    paperWidth: 58 | 80;
    encoding: string;
}

export type PrinterStatus = 'disconnected' | 'connecting' | 'connected' | 'printing' | 'error';

class ThermalPrinterService {
    private currentDevice: BluetoothDevice | null = null;
    private config: PrinterConfig = {
        paperWidth: 58,
        encoding: 'GBK',
    };
    private status: PrinterStatus = 'disconnected';

    async initialize(): Promise<boolean> {
        try {
            if (Platform.OS !== 'android') {
                console.warn('Thermal printer only supported on Android');
                return false;
            }

            // Don't check isBluetoothEnabled() - it causes NOT_STARTED error
            // Just proceed and let scan/connect fail if Bluetooth is off
            await this.loadLastPrinter();
            return true;
        } catch (error) {
            console.error('Failed to initialize thermal printer:', error);
            return false;
        }
    }

    async scanDevices(): Promise<BluetoothDevice[]> {
        try {
            // WORKAROUND: Use getPairedDevices instead of scan
            // scanDevices has NOT_STARTED issue, so we just return paired devices
            return await this.getPairedDevices();
        } catch (error) {
            console.error('Failed to get paired devices:', error);
            throw error;
        }
    }

    async getPairedDevices(): Promise<BluetoothDevice[]> {
        try {
            // Get paired/bonded devices without scanning
            // This uses BluetoothAdapter.getBondedDevices() which is more reliable
            const result = await BluetoothManager.enableBluetooth();

            // enableBluetooth returns array of paired devices
            if (Array.isArray(result)) {
                return result.map((deviceStr: string) => {
                    try {
                        const device = typeof deviceStr === 'string' ? JSON.parse(deviceStr) : deviceStr;
                        return {
                            address: device.address,
                            name: device.name || 'Unknown Device',
                        };
                    } catch (e) {
                        console.error('Failed to parse device:', e);
                        return null;
                    }
                }).filter((d): d is BluetoothDevice => d !== null);
            }

            return [];
        } catch (error) {
            console.error('Failed to get paired devices:', error);
            return [];
        }
    }


    async connect(device: BluetoothDevice): Promise<boolean> {
        try {
            this.status = 'connecting';
            await BluetoothManager.connect(device.address);

            this.currentDevice = device;
            this.status = 'connected';

            await this.saveLastPrinter(device);
            return true;
        } catch (error) {
            console.error('Failed to connect to printer:', error);
            this.status = 'error';
            return false;
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.currentDevice) {
                await BluetoothManager.disconnect(this.currentDevice.address);
            }
            this.currentDevice = null;
            this.status = 'disconnected';
        } catch (error) {
            console.error('Failed to disconnect printer:', error);
        }
    }

    async isConnected(): Promise<boolean> {
        try {
            // Check if we have a device saved and status is connected
            return this.currentDevice !== null && this.status === 'connected';
        } catch (error) {
            return false;
        }
    }

    getCurrentDevice(): BluetoothDevice | null {
        return this.currentDevice;
    }

    getStatus(): PrinterStatus {
        return this.status;
    }

    setConfig(config: Partial<PrinterConfig>): void {
        this.config = { ...this.config, ...config };
    }

    getConfig(): PrinterConfig {
        return this.config;
    }

    async print(commands: string[]): Promise<boolean> {
        try {
            if (!this.currentDevice) {
                throw new Error('No printer connected');
            }

            this.status = 'printing';

            for (const command of commands) {
                await BluetoothEscposPrinter.printText(command, {});
            }

            this.status = 'connected';
            return true;
        } catch (error) {
            console.error('Failed to print:', error);
            this.status = 'error';
            return false;
        }
    }

    async testPrint(): Promise<boolean> {
        try {
            if (!this.currentDevice) {
                throw new Error('No printer connected');
            }

            // Center alignment for test print
            // @ts-ignore - Method exists but not in type definitions
            await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
            await BluetoothEscposPrinter.printText('\n', {});
            await BluetoothEscposPrinter.printText('KasirGO POS\n', {});
            await BluetoothEscposPrinter.printText('Test Print\n', {});

            // Back to left align
            // @ts-ignore - Method exists but not in type definitions
            await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
            await BluetoothEscposPrinter.printText('--------------------------------\n', {});
            await BluetoothEscposPrinter.printText('Printer: ' + this.currentDevice.name + '\n', {});
            await BluetoothEscposPrinter.printText('Status: Connected\n', {});
            await BluetoothEscposPrinter.printText('--------------------------------\n', {});
            await BluetoothEscposPrinter.printText('\n\n\n', {});

            return true;
        } catch (error) {
            console.error('Test print failed:', error);
            return false;
        }
    }

    private async saveLastPrinter(device: BluetoothDevice): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(device));
        } catch (error) {
            console.error('Failed to save last printer:', error);
        }
    }

    private async loadLastPrinter(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const device = JSON.parse(stored);
                this.currentDevice = device;
                // Try to reconnect to last printer
                try {
                    await BluetoothManager.connect(device.address);
                    this.status = 'connected';
                    console.log('Auto-reconnected to last printer:', device.name);
                } catch (error) {
                    console.log('Could not auto-reconnect to last printer:', error);
                    this.status = 'disconnected';
                }
            }
        } catch (error) {
            console.error('Failed to load last printer:', error);
        }
    }

    async clearLastPrinter(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            this.currentDevice = null;
        } catch (error) {
            console.error('Failed to clear last printer:', error);
        }
    }
}

export default new ThermalPrinterService();
