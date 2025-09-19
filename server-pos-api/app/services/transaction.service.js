const prisma = require("../config/mysql.db");

async function createTransaction(payload) {
  const { cashierId, items } = payload;

  if (!cashierId || !items || !Array.isArray(items) || items.length === 0) {
    throw new Error("cashierId dan items wajib diisi");
  }

  return await prisma.$transaction(async (tx) => {
    const productIds = items.map(i => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } }
    });

    if (products.length !== productIds.length) {
      throw new Error("Ada produk yang tidak ditemukan");
    }

    let total = 0;
    const transactionItemsData = items.map((item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Produk ${item.productId} tidak ditemukan`);
      if (product.stock < item.quantity) {
        throw new Error(`Stok produk ${product.name} tidak cukup`);
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
        total
      }
    });

    await tx.transactionItem.createMany({
      data: transactionItemsData.map((item) => ({
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
  const where = {};

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  if (cashierId) {
    where.cashierId = Number(cashierId);
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        items: {
          include: { product: true }
        },
        cashier: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where })
  ]);

  return {
    data: transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  };
}


module.exports = {
  createTransaction,
  getAllTransactions
};