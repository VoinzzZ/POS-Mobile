# 🔧 Connection Setup & Troubleshooting Guide

## ✅ Checklist Koneksi

### 1. **Backend Server**
Pastikan server berjalan di: `http://192.168.10.33:8888`

**Test Health Check:**
```powershell
Invoke-RestMethod -Uri "http://192.168.10.33:8888/health" -Method Get
```

Expected Response:
```json
{
  "status": "OK",
  "version": "v1",
  "timestamp": "2025-10-03T10:23:20.183Z",
  "environment": "development"
}
```

---

### 2. **Database Connection**
Pastikan MySQL database sudah migrate dan running.

**Check Tables:**
```sql
USE pos_db;
SHOW TABLES;

-- Should show:
-- Brand, Category, Product, User, etc.
```

**Run Migrations (if needed):**
```bash
cd server-pos-api
npx prisma migrate dev
npx prisma generate
```

---

### 3. **Frontend Configuration**

**File: `KasirGO/.env`**
```env
API_URL=http://192.168.10.33:8888/api/v1
APP_NAME=KasirGO
NODE_ENV=development
```

**Important:** Ganti `192.168.10.33` dengan IP address komputer Anda!

**Cara cek IP:**
```powershell
# Windows
ipconfig | Select-String "IPv4"

# Output example:
# IPv4 Address. . . . . . . . . . . : 192.168.10.33
```

---

### 4. **API Endpoints yang Digunakan**

#### **Products:**
```
GET    /api/v1/product              - Get all products
GET    /api/v1/product/:id          - Get product by ID
POST   /api/v1/product              - Create product (Admin only)
PUT    /api/v1/product/:id          - Update product (Admin only)
DELETE /api/v1/product/:id          - Delete product (Admin only)
```

#### **Categories:**
```
GET    /api/v1/category             - Get all categories
GET    /api/v1/category/:id         - Get category by ID
POST   /api/v1/category             - Create category (Admin only)
PUT    /api/v1/category/:id         - Update category (Admin only)
DELETE /api/v1/category/:id         - Delete category (Admin only)
```

#### **Brands:**
```
GET    /api/v1/brand                - Get all brands
GET    /api/v1/brand/:id            - Get brand by ID
POST   /api/v1/brand                - Create brand (Admin only)
PUT    /api/v1/brand/:id            - Update brand (Admin only)
DELETE /api/v1/brand/:id             - Delete brand (Admin only)
```

---

## 🐛 Troubleshooting

### **Issue 1: Cannot Connect to Server**

**Symptoms:**
- "Network Error"
- "ECONNREFUSED"

**Solutions:**
1. ✅ Check if server is running:
   ```powershell
   Test-NetConnection -ComputerName 192.168.10.33 -Port 8888
   ```

2. ✅ Start server:
   ```bash
   cd server-pos-api
   npm run dev
   ```

3. ✅ Check firewall - allow port 8888

---

### **Issue 2: 401 Unauthorized**

**Symptoms:**
- "Unauthorized"
- "Token expired"

**Solutions:**
1. ✅ Login ulang di app
2. ✅ Check if token is saved:
   ```javascript
   // In React Native Debugger
   AsyncStorage.getItem('@tokens').then(console.log)
   ```

---

### **Issue 3: 500 Internal Server Error**

**Symptoms:**
- "Internal Server Error"
- API returns 500

**Solutions:**
1. ✅ Check server logs (terminal yang run `npm run dev`)
2. ✅ Check database connection
3. ✅ Run migrations:
   ```bash
   npx prisma migrate dev
   ```

---

### **Issue 4: "Network request failed"**

**Symptoms:**
- Timeout errors
- "Network request failed"

**Solutions:**
1. ✅ Update API_URL in `.env`:
   ```bash
   # Find your IP
   ipconfig
   
   # Update .env
   API_URL=http://YOUR_IP_HERE:8888/api/v1
   ```

2. ✅ Restart Expo:
   ```bash
   # Stop Expo (Ctrl+C)
   # Delete cache
   npx expo start --clear
   ```

3. ✅ Make sure phone/emulator on SAME NETWORK

---

## 🧪 Testing APIs

### **Test dengan Postman/Insomnia:**

#### 1. Login first:
```
POST http://192.168.10.33:8888/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "YourPassword123"
}
```

Copy `accessToken` from response.

#### 2. Test Get Categories:
```
GET http://192.168.10.33:8888/api/v1/category
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

#### 3. Test Create Category:
```
POST http://192.168.10.33:8888/api/v1/category
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "name": "Makanan"
}
```

---

## 📱 Mobile App Testing

### **Start Frontend:**
```bash
cd KasirGO
npx expo start
```

### **Test Flow:**
1. ✅ Login sebagai Admin
2. ✅ Go to Products menu
3. ✅ Try to load data (pull to refresh)
4. ✅ Click FAB (+) untuk add product/category/brand
5. ✅ Check if data appears

### **Debug Mode:**
```bash
# Enable React Native Debugger
npx expo start
# Press 'j' to open debugger
# Check Console for API logs
```

---

## 🔍 Check API Logs

Server logs akan show semua requests. Look for:

```
✅ Good:
POST /api/v1/category - 201 Created
GET /api/v1/product - 200 OK

❌ Bad:
POST /api/v1/category - 500 Internal Server Error
GET /api/v1/product - 401 Unauthorized
```

---

## 📝 Quick Commands

**Start Backend:**
```bash
cd server-pos-api
npm run dev
```

**Start Frontend:**
```bash
cd KasirGO
npx expo start --clear
```

**Reset Everything:**
```bash
# Backend
cd server-pos-api
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate

# Frontend
cd KasirGO
rm -rf node_modules .expo
npm install
npx expo start --clear
```

---

## ✨ Success Indicators

Jika semua berjalan dengan baik, Anda akan lihat:

1. ✅ Stats cards showing product/category/brand counts
2. ✅ Products list dengan images
3. ✅ Search bar berfungsi
4. ✅ FAB button (+) untuk add items
5. ✅ Edit/Delete buttons berfungsi
6. ✅ Pull to refresh works

---

## 🆘 Still Not Working?

**Check these files:**
1. `KasirGO/.env` - API_URL correct?
2. `server-pos-api/.env` - DATABASE_URL correct?
3. `KasirGO/src/api/axiosInstance.ts` - baseURL using API_URL from .env?

**Console logs to check:**
```javascript
// Should see on app start:
🔗 API_URL: http://192.168.10.33:8888/api/v1

// Should see on API calls:
✅ API Request: GET /category
✅ API Response: 200 OK
```

**If still failing, provide:**
1. Server logs (terminal running npm run dev)
2. Frontend console logs (React Native Debugger)
3. Network tab (what request is failing)
