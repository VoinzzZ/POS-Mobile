const { Expo } = require('expo-server-sdk');

const expo = new Expo({
    accessToken: process.env.EXPO_ACCESS_TOKEN,
    useFcmV1: true
});

const sendPushNotification = async (pushTokens, title, body, data = {}) => {
    const messages = [];

    for (const pushToken of pushTokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }

        messages.push({
            to: pushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
            priority: 'high',
            channelId: 'low-stock-alerts'
        });
    }

    if (messages.length === 0) {
        return { success: false, message: 'No valid push tokens' };
    }

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error('Error sending push notification chunk:', error);
        }
    }

    return {
        success: true,
        sentCount: messages.length,
        tickets: tickets
    };
};

const sendLowStockAlert = async (pushTokens, lowStockProducts) => {
    const count = lowStockProducts.length;
    let title = '⚠️ Peringatan Stok Rendah';
    let body = '';

    if (count === 1) {
        const product = lowStockProducts[0];
        body = `${product.product_name} - Stok: ${product.product_qty}/${product.product_min_stock}`;
    } else {
        body = `${count} produk memiliki stok di bawah minimum`;
    }

    const data = {
        type: 'low-stock',
        count: count,
        products: lowStockProducts.map(p => ({
            product_id: p.product_id,
            product_name: p.product_name,
            product_qty: p.product_qty,
            product_min_stock: p.product_min_stock
        }))
    };

    return await sendPushNotification(pushTokens, title, body, data);
};

module.exports = {
    sendPushNotification,
    sendLowStockAlert
};
