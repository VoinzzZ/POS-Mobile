const { PrismaClient } = require('@prisma/client');

let prisma;

if(process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if(!global.__db) {
        global.__db = new PrismaClient({
            log:['query', 'error', 'warn'],
        });
    }
    prisma = global.__db;
}

module.exports = prisma;