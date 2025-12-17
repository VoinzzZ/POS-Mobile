const config = {
  datasources: {
    db: {
      provider: 'mysql',
      url: process.env.DATABASE_URL,
    },
  },
}

module.exports = config