const prisma = require("../config/mysql.db");

async function createTransaction(payload, cashierId) {
  console.log('🔍 Transaction Service - Payload:', JSON.stringify(payload, null, 2));
  console.log('🔍 Transaction Service - CashierId:', cashierId);
  
  const { items } = payload;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Items required");
  }
  
  console.log('🔍 Transaction Service - Items:', JSON.stringify(items, null, 2));

  return await prisma.$transaction(async (tx) => {
    const productIds = items.map(i => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } }
    });

    if (products.length !== productIds.length) {
      throw new Error("Product not found");
    }

    let total = 0;
    const transactionItemsData = items.map((item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) {
        throw new Error(`Stock product ${product.name} not enough`);
      }

      const subtotal = product.price * item.quantity;
      total += subtotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        subtotal
      };
    });

    const transaction = await tx.transaction.create({
      data: {
        cashierId,
        total,
        status: 'DRAFT'
      }
    });

    await tx.transactionitem.createMany({
      data: transactionItemsData.map(item => ({
        ...item,
        transactionId: transaction.id
      }))
    });

    await Promise.all(
      transactionItemsData.map(item =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      )
    );

    return {
      ...transaction,
      items: transactionItemsData
    };
  });
}

async function getAllTransactions({ startDate, endDate, cashierId, page = 1, limit = 10 }) {
  const today = new Date();
  const start = startDate ? new Date(startDate) : new Date(today.setHours(0,0,0,0));
  const end = endDate ? new Date(endDate) : new Date(today.setHours(23,59,59,999));

  const where = {
    createdAt: { gte: start, lte: end },
    ...(cashierId && { cashierId: Number(cashierId) })
  };

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        transactionitem: { include: { product: true } },
        user: { select: { userName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.transaction.count({ where })
  ]);

  // Map transactionitem to items for compatibility
  const mappedTransactions = transactions.map(t => ({
    ...t,
    items: t.transactionitem,
    cashier: t.user
  }));

  return {
    data: mappedTransactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function getTransactionDetail(transactionId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: Number(transactionId) },
    include: {
      transactionitem: { include: { product: true } },
      user: { select: { userName: true, email: true } }
    }
  });

  if (!transaction) throw new Error('Transaction not found');
  
  // Map transactionitem to items for compatibility
  return {
    ...transaction,
    items: transaction.transactionitem,
    cashier: transaction.user
  };
}

async function deleteTransaction(transactionId, cashierId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: Number(transactionId) },
    include: { transactionitem: true }
  });

  if (!transaction) throw new Error('Transaction not found');
  if (transaction.cashierId !== cashierId) throw new Error('Not authorized');
  if (transaction.status !== 'DRAFT') throw new Error('Cannot delete locked transaction');

  const today = new Date();
  const start = new Date(today.setHours(0,0,0,0));
  const end = new Date(today.setHours(23,59,59,999));
  if (transaction.createdAt < start || transaction.createdAt > end) {
    throw new Error('Can only delete today\'s transaction');
  }

  // kembalikan stok
  await Promise.all(transaction.transactionitem.map(item =>
    prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } }
    })
  ));

  await prisma.transaction.delete({ where: { id: Number(transactionId) } });

  return { message: 'Transaction deleted successfully' };
}

// Complete Transaction Payment
async function completeTransactionPayment(transactionId, paymentAmount, cashierId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: Number(transactionId) },
    include: { transactionitem: { include: { product: true } }, user: true }
  });

  if (!transaction) throw new Error('Transaction not found');
  if (transaction.cashierId !== cashierId) throw new Error('Not authorized');
  if (transaction.status !== 'DRAFT') throw new Error('Transaction already completed');
  
  if (paymentAmount < transaction.total) {
    throw new Error(`Insufficient payment. Required: ${transaction.total}, Provided: ${paymentAmount}`);
  }

  const changeAmount = paymentAmount - transaction.total;

  const updatedTransaction = await prisma.transaction.update({
    where: { id: Number(transactionId) },
    data: {
      paymentAmount,
      changeAmount,
      status: 'COMPLETED',
      completedAt: new Date()
    },
    include: {
      transactionitem: { include: { product: true } },
      user: { select: { userName: true, email: true } }
    }
  });

  // Map transactionitem to items for compatibility
  return {
    ...updatedTransaction,
    items: updatedTransaction.transactionitem,
    cashier: updatedTransaction.user
  };
}

// Get Receipt Data
async function getReceiptData(transactionId, cashierId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: Number(transactionId) },
    include: {
      transactionitem: { include: { product: true } },
      user: { select: { userName: true, email: true } }
    }
  });

  if (!transaction) throw new Error('Transaction not found');
  if (transaction.cashierId !== cashierId) throw new Error('Not authorized');
  if (transaction.status !== 'COMPLETED') throw new Error('Transaction not completed yet');

  // Map transactionitem to items for compatibility
  return {
    ...transaction,
    items: transaction.transactionitem,
    cashier: transaction.user
  };
}

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionDetail,
  deleteTransaction,
  completeTransactionPayment,
  getReceiptData
};
