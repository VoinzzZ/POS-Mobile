const prisma = require('../app/config/mysql.db.js');

const syncExistingSalesTransactions = async () => {
    try {
        console.log('Starting sync of existing sales transactions...');

        const completedTransactions = await prisma.t_transaction.findMany({
            where: {
                transaction_status: 'COMPLETED',
                deleted_at: null
            },
            select: {
                transaction_id: true,
                transaction_number: true,
                transaction_total: true,
                transaction_payment_method: true,
                transaction_completed_at: true,
                transaction_cashier_id: true,
                tenant_id: true
            }
        });

        console.log(`Found ${completedTransactions.length} completed transactions`);

        let syncedCount = 0;
        let skippedCount = 0;

        for (const transaction of completedTransactions) {
            const existingCashTransaction = await prisma.t_cash_transaction.findFirst({
                where: {
                    sale_transaction_id: transaction.transaction_id,
                    tenant_id: transaction.tenant_id,
                    deleted_at: null
                }
            });

            if (existingCashTransaction) {
                console.log(`Transaction #${transaction.transaction_number} already synced, skipping...`);
                skippedCount++;
                continue;
            }

            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            const lastCashTransaction = await prisma.t_cash_transaction.findFirst({
                where: {
                    tenant_id: transaction.tenant_id,
                    transaction_number: {
                        startsWith: `CSH-${year}${month}${day}`
                    }
                },
                orderBy: {
                    transaction_number: 'desc'
                }
            });

            let sequence = 1;
            if (lastCashTransaction) {
                const lastSequence = parseInt(lastCashTransaction.transaction_number.split('-')[2]);
                sequence = lastSequence + 1;
            }

            const cashTransactionNumber = `CSH-${year}${month}${day}-${String(sequence).padStart(4, '0')}`;

            await prisma.t_cash_transaction.create({
                data: {
                    transaction_number: cashTransactionNumber,
                    tenant_id: transaction.tenant_id,
                    transaction_type: 'INCOME',
                    amount: parseFloat(transaction.transaction_total),
                    payment_method: transaction.transaction_payment_method || 'CASH',
                    category_type: 'SALES',
                    sale_transaction_id: transaction.transaction_id,
                    description: `Penjualan #${transaction.transaction_number}`,
                    transaction_date: transaction.transaction_completed_at || new Date(),
                    created_by: transaction.transaction_cashier_id
                }
            });

            console.log(`Synced transaction #${transaction.transaction_number} -> ${cashTransactionNumber}`);
            syncedCount++;
        }

        console.log(`\nSync completed!`);
        console.log(`Total transactions: ${completedTransactions.length}`);
        console.log(`Newly synced: ${syncedCount}`);
        console.log(`Already synced (skipped): ${skippedCount}`);

        return {
            total: completedTransactions.length,
            synced: syncedCount,
            skipped: skippedCount
        };
    } catch (error) {
        console.error('Error syncing transactions:', error);
        throw error;
    }
};

syncExistingSalesTransactions()
    .then((result) => {
        console.log('\n✅ Sync successful:', result);
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Sync failed:', error);
        process.exit(1);
    });
