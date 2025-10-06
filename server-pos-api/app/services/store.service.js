const prisma = require("../config/mysql.db");

/**
 * Get store settings (only one store per system)
 */
async function getStoreSettings() {
  // Get first store or create default
  let store = await prisma.store.findFirst();
  
  if (!store) {
    // Create default store if not exists
    store = await prisma.store.create({
      data: {
        name: "KasirGO",
        address: null,
        phone: null,
        email: null,
        logoUrl: null,
        description: null,
      }
    });
  }
  
  return store;
}

/**
 * Update store settings
 */
async function updateStoreSettings(data) {
  const { name, address, phone, email, logoUrl, description } = data;
  
  // Get existing store
  let store = await prisma.store.findFirst();
  
  if (!store) {
    // Create if not exists
    store = await prisma.store.create({
      data: {
        name: name || "KasirGO",
        address,
        phone,
        email,
        logoUrl,
        description,
      }
    });
  } else {
    // Update existing
    store = await prisma.store.update({
      where: { id: store.id },
      data: {
        ...(name && { name }),
        address,
        phone,
        email,
        logoUrl,
        description,
      }
    });
  }
  
  return store;
}

module.exports = {
  getStoreSettings,
  updateStoreSettings,
};
