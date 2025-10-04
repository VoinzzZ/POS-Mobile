import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import { Transaction } from '../api/transaction';

interface ReceiptData {
  transaction: Transaction;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
}

export const generateReceiptHTML = (data: ReceiptData): string => {
  const { transaction, companyName = "KasirGO POS", companyAddress = "", companyPhone = "" } = data;
  
  const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt #${transaction.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          line-height: 1.4;
          color: #000;
          width: 100%;
          margin: 0;
          padding: 20px;
          box-sizing: border-box;
        }
        
        .header {
          text-align: center;
          margin-bottom: 15px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        
        .company-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .company-info {
          font-size: 10px;
          margin-bottom: 2px;
        }
        
        .transaction-info {
          margin-bottom: 15px;
          font-size: 10px;
        }
        
        .transaction-info div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        
        .items {
          margin-bottom: 15px;
        }
        
        .item {
          margin-bottom: 8px;
          padding-bottom: 5px;
          border-bottom: 1px dotted #ccc;
        }
        
        .item-name {
          font-weight: bold;
          margin-bottom: 2px;
        }
        
        .item-details {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
        }
        
        .totals {
          border-top: 1px dashed #000;
          padding-top: 10px;
          margin-bottom: 15px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        
        .grand-total {
          font-weight: bold;
          font-size: 14px;
          border-top: 1px solid #000;
          padding-top: 5px;
          margin-top: 5px;
        }
        
        .payment-info {
          margin-bottom: 15px;
          font-size: 11px;
        }
        
        .footer {
          text-align: center;
          border-top: 1px dashed #000;
          padding-top: 10px;
          font-size: 10px;
        }
        
        .thank-you {
          font-weight: bold;
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${companyName}</div>
        ${companyAddress ? `<div class="company-info">${companyAddress}</div>` : ''}
        ${companyPhone ? `<div class="company-info">Tel: ${companyPhone}</div>` : ''}
      </div>
      
      <div class="transaction-info">
        <div>
          <span>Transaction ID:</span>
          <span>#${transaction.id}</span>
        </div>
        <div>
          <span>Date:</span>
          <span>${formatDate(transaction.completedAt || transaction.createdAt)}</span>
        </div>
        <div>
          <span>Cashier:</span>
          <span>${transaction.cashier?.userName || 'N/A'}</span>
        </div>
      </div>
      
      <div class="items">
        ${transaction.items.map(item => `
          <div class="item">
            <div class="item-name">${item.product.name}</div>
            <div class="item-details">
              <span>${formatCurrency(item.price)} x ${item.quantity}</span>
              <span>${formatCurrency(item.subtotal)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(transaction.total)}</span>
        </div>
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>${formatCurrency(transaction.total)}</span>
        </div>
      </div>
      
      ${transaction.paymentAmount ? `
        <div class="payment-info">
          <div class="total-row">
            <span>Payment:</span>
            <span>${formatCurrency(transaction.paymentAmount)}</span>
          </div>
          <div class="total-row">
            <span>Change:</span>
            <span>${formatCurrency(transaction.changeAmount || 0)}</span>
          </div>
        </div>
      ` : ''}
      
      <div class="footer">
        <div class="thank-you">Thank You!</div>
        <div>Have a great day!</div>
        <div>Receipt generated by KasirGO POS</div>
      </div>
    </body>
    </html>
  `;
};

export const generateReceiptPDF = async (receiptData: ReceiptData): Promise<{ success: boolean; filePath?: string; error?: string }> => {
  try {
    const html = generateReceiptHTML(receiptData);
    
    // Generate PDF using Expo Print
    const { uri } = await Print.printToFileAsync({
      html,
      width: 612, // A4 width in points
      height: 792, // A4 height in points 
      base64: false,
      margins: {
        left: 20,
        top: 20,
        right: 20,
        bottom: 20,
      },
    });
    
    if (uri) {
      return {
        success: true,
        filePath: uri
      };
    } else {
      return {
        success: false,
        error: 'Failed to generate PDF file'
      };
    }
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
};

export const shareReceipt = async (filePath: string): Promise<boolean> => {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Receipt',
        UTI: 'public.pdf'
      });
      return true;
    } else {
      Alert.alert('Error', 'Sharing is not available on this device');
      return false;
    }
  } catch (error: any) {
    console.error('Share error:', error);
    Alert.alert('Error', 'Failed to share receipt');
    return false;
  }
};

export const saveReceiptToDownloads = async (filePath: string, fileName: string): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      // For Android, try to save to downloads directory
      const downloadUri = `${FileSystem.documentDirectory}${fileName}.pdf`;
      await FileSystem.copyAsync({
        from: filePath,
        to: downloadUri
      });
      
      Alert.alert(
        'Success', 
        `Receipt saved as ${fileName}.pdf in app documents folder`,
        [{ text: 'OK' }]
      );
      
      return true;
    } else {
      // For iOS, the file is already in Documents directory
      const documentUri = `${FileSystem.documentDirectory}${fileName}.pdf`;
      await FileSystem.copyAsync({
        from: filePath,
        to: documentUri
      });
      
      Alert.alert(
        'Success',
        `Receipt saved as ${fileName}.pdf in Documents folder`,
        [{ text: 'OK' }]
      );
      
      return true;
    }
  } catch (error: any) {
    console.error('Save error:', error);
    Alert.alert('Error', 'Failed to save receipt');
    return false;
  }
};
