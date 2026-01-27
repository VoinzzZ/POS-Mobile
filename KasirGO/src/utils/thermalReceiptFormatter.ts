// @ts-ignore - Library doesn't have official TypeScript definitions
import { BluetoothEscposPrinter } from '@vardrz/react-native-bluetooth-escpos-printer';
import { Transaction } from '../api/transaction';

interface ReceiptData {
    transaction: Transaction;
    companyName?: string;
    companyDescription?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    paperWidth?: 58 | 80;
}

export class ThermalReceiptFormatter {
    private width: number;

    constructor(paperWidth: 58 | 80 = 58) {
        this.width = paperWidth === 58 ? 32 : 48;
    }

    async printReceipt(data: ReceiptData): Promise<void> {
        const {
            transaction,
            companyName = 'KasirGO',
            companyDescription = '',
            companyAddress = '',
            companyPhone = '',
            companyEmail = '',
        } = data;

        try {
            await this.printHeader(companyName, companyDescription, companyAddress, companyPhone, companyEmail);
            await this.printDivider();
            await this.printReceiptTitle(transaction);
            await this.printTransactionInfo(transaction);
            await this.printDivider();
            await this.printItemsHeader();
            await this.printItems(transaction);
            await this.printDivider();
            await this.printTotals(transaction);

            if (transaction.paymentAmount !== null && transaction.paymentAmount !== undefined) {
                await this.printPaymentInfo(transaction);
            }

            await this.printDivider();
            await this.printFooter();
            await this.printNewLines(3);
        } catch (error) {
            console.error('Failed to format receipt:', error);
            throw error;
        }
    }

    private async printHeader(name: string, description: string, address: string, phone: string, email: string): Promise<void> {
        // Ensure we start with left alignment to reset any previous state
        // @ts-ignore - Method exists but not in type definitions
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);

        // Center-align for header
        // @ts-ignore - Method exists but not in type definitions
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
        await BluetoothEscposPrinter.printText('\n', {});
        await BluetoothEscposPrinter.printText(name + '\n', {});

        if (description) {
            await BluetoothEscposPrinter.printText(description + '\n', {});
        }

        if (address) {
            await BluetoothEscposPrinter.printText(address + '\n', {});
        }

        if (phone || email) {
            let contactLine = '';
            if (phone) contactLine += 'Telp: ' + phone;
            if (phone && email) contactLine += ' | ';
            if (email) contactLine += 'Email: ' + email;
            await BluetoothEscposPrinter.printText(contactLine + '\n', {});
        }

        // Reset to left align for rest of receipt
        // @ts-ignore - Method exists but not in type definitions
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    }

    private async printDivider(): Promise<void> {
        await BluetoothEscposPrinter.printText(this.repeat('-', this.width) + '\n', {});
    }

    private async printReceiptTitle(transaction: Transaction): Promise<void> {
        // Center-aligned title
        // @ts-ignore - Method exists but not in type definitions
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
        await BluetoothEscposPrinter.printText('\n', {});
        await BluetoothEscposPrinter.printText('Transaksi\n', {});
        await BluetoothEscposPrinter.printText(`#${transaction.dailyNumber || transaction.id}\n`, {});
        await BluetoothEscposPrinter.printText('\n', {});
        // Back to left align
        // @ts-ignore - Method exists but not in type definitions
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    }

    private async printTransactionInfo(transaction: Transaction): Promise<void> {
        const cashier = `${transaction.cashier?.userName || 'N/A'}`;
        const cashierLine = this.formatLine('Kasir:', cashier);
        await BluetoothEscposPrinter.printText(cashierLine + '\n', {});

        const totalItemsLine = this.formatLine('Total Item:', `${transaction.items.length} item`);
        await BluetoothEscposPrinter.printText(totalItemsLine + '\n', {});
    }

    private async printItemsHeader(): Promise<void> {
        await BluetoothEscposPrinter.printText('Detail Pembelian\n', {});
        await BluetoothEscposPrinter.printText('\n', {});
    }

    private async printItems(transaction: Transaction): Promise<void> {
        for (const item of transaction.items) {
            // Product name
            await BluetoothEscposPrinter.printText(item.product.name + '\n', {});

            // Price x Qty and Subtotal
            const priceQty = `${item.quantity} x ${this.formatCurrency(item.price)}`;
            const subtotal = this.formatCurrency(item.subtotal);

            const line = this.formatLine(priceQty, subtotal);
            await BluetoothEscposPrinter.printText(line + '\n', {});
        }
    }

    private async printTotals(transaction: Transaction): Promise<void> {
        const subtotalLine = this.formatLine('Subtotal:', this.formatCurrency(transaction.total));
        await BluetoothEscposPrinter.printText(subtotalLine + '\n', {});

        await BluetoothEscposPrinter.printText('\n', {});

        // Bold TOTAL
        const totalLine = this.formatLine('TOTAL:', this.formatCurrency(transaction.total));
        await BluetoothEscposPrinter.printText(totalLine + '\n', {});
    }

    private async printPaymentInfo(transaction: Transaction): Promise<void> {
        if (transaction.paymentAmount === null || transaction.paymentAmount === undefined) return;

        const paymentMethod = transaction.paymentMethod === 'CASH' ? 'Tunai' :
            transaction.paymentMethod === 'QRIS' ? 'QRIS' : 'Debit';
        const methodLine = this.formatLine('Metode:', paymentMethod);
        await BluetoothEscposPrinter.printText(methodLine + '\n', {});

        const paymentLine = this.formatLine('Bayar:', this.formatCurrency(transaction.paymentAmount));
        await BluetoothEscposPrinter.printText(paymentLine + '\n', {});

        const changeLine = this.formatLine('Kembalian:', this.formatCurrency(transaction.changeAmount || 0));
        await BluetoothEscposPrinter.printText(changeLine + '\n', {});
    }

    private async printFooter(): Promise<void> {
        // Center-aligned footer
        // @ts-ignore - Method exists but not in type definitions
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
        await BluetoothEscposPrinter.printText('\n', {});
        await BluetoothEscposPrinter.printText('Terima kasih atas kunjungan Anda!\n', {});
        await BluetoothEscposPrinter.printText('Made by KasirGo - @VoinzzZ\n', {});

        // Back to left align
        // @ts-ignore - Method exists but not in type definitions
        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    }

    private async printNewLines(count: number): Promise<void> {
        for (let i = 0; i < count; i++) {
            await BluetoothEscposPrinter.printText('\n', {});
        }
    }

    private formatCurrency(amount: number): string {
        return 'Rp ' + amount.toLocaleString('id-ID');
    }

    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    private formatLine(left: string, right: string): string {
        const spacesNeeded = this.width - left.length - right.length;
        const spaces = spacesNeeded > 0 ? this.repeat(' ', spacesNeeded) : ' ';
        return left + spaces + right;
    }

    private repeat(char: string, count: number): string {
        return char.repeat(count);
    }
}

export default ThermalReceiptFormatter;
