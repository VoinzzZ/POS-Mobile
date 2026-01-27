export interface BluetoothDevice {
    address: string;
    name: string;
}

export interface PrinterConfig {
    paperWidth: 58 | 80;
    encoding: string;
}

export type PrinterStatus = 'disconnected' | 'connecting' | 'connected' | 'printing' | 'error';

export interface ESCPOSAlignment {
    LEFT: number;
    CENTER: number;
    RIGHT: number;
}

export interface ESCPOSTextOptions {
    widthtimes?: number;
    heigthtimes?: number;
}
