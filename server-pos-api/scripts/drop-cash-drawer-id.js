const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function dropCashDrawerId() {
    try {
        console.log('Checking if cash_drawer_id column exists...');

        const result = await prisma.$queryRawUnsafe(`
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE table_schema = DATABASE()
            AND table_name = 't_transaction'
            AND column_name = 'cash_drawer_id'
        `);

        const columnExists = result[0].count > 0;

        if (columnExists) {
            console.log('Column cash_drawer_id exists. Dropping it...');
            await prisma.$queryRawUnsafe('ALTER TABLE `t_transaction` DROP COLUMN `cash_drawer_id`');
            console.log('✓ Successfully dropped cash_drawer_id column');
        } else {
            console.log('✓ Column cash_drawer_id does not exist. Nothing to do.');
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

dropCashDrawerId();
