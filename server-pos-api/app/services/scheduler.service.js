const cron = require('node-cron');
const prisma = require('../config/mysql.db');

// Auto-lock transactions at midnight (00:00)
// Semua transaksi COMPLETED hari ini akan di-LOCK
const lockDailyTransactions = async () => {
  try {
    console.log('🕐 Running midnight auto-lock job...');
    
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Update semua transaksi COMPLETED hari ini jadi LOCKED
    const result = await prisma.transaction.updateMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      data: {
        status: 'LOCKED'
      }
    });

    console.log(`✅ Locked ${result.count} transactions from today`);
    console.log(`📅 Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error locking daily transactions:', error);
    throw error;
  }
};

// Manual trigger untuk testing
const lockTransactionsManual = async (date) => {
  try {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    console.log(`🔒 Manually locking transactions for ${startOfDay.toLocaleDateString('id-ID')}`);

    const result = await prisma.transaction.updateMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      data: {
        status: 'LOCKED'
      }
    });

    console.log(`✅ Manually locked ${result.count} transactions`);
    return result;
  } catch (error) {
    console.error('❌ Error manually locking transactions:', error);
    throw error;
  }
};

// Start scheduler
const startScheduler = () => {
  // Run every day at midnight (00:00)
  // Format: second minute hour day month weekday
  cron.schedule('0 0 0 * * *', async () => {
    console.log('\n🌙 Midnight reached - Starting auto-lock process...');
    await lockDailyTransactions();
  }, {
    scheduled: true,
    timezone: "Asia/Jakarta" // Sesuaikan dengan timezone Indonesia
  });

  console.log('⏰ Scheduler started - Will auto-lock transactions at midnight');
  console.log('🌍 Timezone: Asia/Jakarta');
};

module.exports = {
  startScheduler,
  lockDailyTransactions,
  lockTransactionsManual
};
