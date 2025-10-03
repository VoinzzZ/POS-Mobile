# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

KasirGO is a Point of Sale (POS) mobile application built with React Native/Expo and a Node.js/Express backend API. The system supports two user roles: ADMIN and CASHIER, with separate interfaces for each role.

### Architecture

- **Frontend**: React Native with Expo Router for file-based routing
- **Backend**: Node.js/Express API with Prisma ORM and MySQL database  
- **Authentication**: JWT-based with access/refresh tokens
- **State Management**: React Context for auth and theme management
- **Database**: MySQL with Prisma schema for User, Product, Category, Brand, and Transaction models

## Common Development Commands

### Backend Server (server-pos-api/)

```powershell
# Start development server
cd server-pos-api
npm run dev

# Database operations
npx prisma migrate dev
npx prisma generate  
npx prisma migrate reset

# Test server health
Invoke-RestMethod -Uri "http://localhost:8888/health" -Method Get
```

### Frontend App (KasirGO/)

```powershell
# Start Expo development server
cd KasirGO
npx expo start

# Start with cache cleared (recommended for troubleshooting)
npx expo start --clear

# Full cache reset (use when environment variables change)
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
npx expo start --clear --reset-cache

# Platform-specific starts
npx expo start --android
npx expo start --ios
npx expo start --web

# Run tests
npm test
```

### Network Troubleshooting

```powershell
# Check your current IP address
ipconfig | Select-String "IPv4"

# Test API server connectivity  
Test-NetConnection -ComputerName YOUR_IP_HERE -Port 8888

# Check if port 8888 is listening
netstat -an | Select-String ":8888"

# Test API health endpoint
Invoke-RestMethod -Uri "http://YOUR_IP_HERE:8888/health" -Method Get
```

## Project Structure

### Backend API Architecture
- **Routes**: RESTful API endpoints at `/api/v1/` with separate route files for auth, admin, products, categories, brands, transactions
- **Controllers**: Business logic handlers for each domain
- **Services**: Data access layer using Prisma Client
- **Middlewares**: Authentication, rate limiting, logging, error handling
- **Database**: MySQL with Prisma migrations for schema management

### Frontend App Architecture  
- **App Router**: Expo Router with file-based routing using (admin) and (cashier) route groups
- **Context Providers**: AuthContext for authentication state, ThemeContext for UI theming
- **API Layer**: Axios instance with automatic token injection and refresh logic
- **Screens**: Separate dashboard, products, settings interfaces for admin and cashier roles

### Key Models
- **User**: userName, email, password, role (ADMIN|CASHIER), verification status
- **Product**: name, price, stock, imageUrl with brand and category relationships  
- **Transaction**: cashier tracking, items, total, status (DRAFT|LOCKED)
- **Authentication**: Registration pins, email verification, password resets

## Configuration

### Environment Setup

**Backend (.env in server-pos-api/)**:
```env
DATABASE_URL="mysql://user:pass@localhost:3306/pos_db"  
PORT=8888
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

**Frontend (.env in KasirGO/)**:
```env
API_URL=http://YOUR_IP_ADDRESS:8888/api/v1
NODE_ENV=development
```

**Critical**: Always update API_URL with your current local IP address. Use `ipconfig | Select-String "IPv4"` to find your IPv4 address and update the .env file. After changing environment variables, always restart Expo with full cache clearing.

### Common Connection Issues

1. **Network Error with old IP**: 
   - Update API_URL in KasirGO/.env with current IP address
   - Clear all caches: `Remove-Item -Path ".expo" -Recurse -Force`
   - Restart: `npx expo start --clear --reset-cache`

2. **401 Unauthorized**: Token expired, re-login or check AsyncStorage token storage  

3. **500 Internal Server Error**: Check server logs, run database migrations

4. **Port conflicts**: Expo defaults to 8081, use `--port 8082` if needed

## Testing & Debugging

### API Testing
Use the detailed API endpoint documentation in `CONNECTION_SETUP.md` for manual testing with tools like Postman or direct PowerShell requests.

Key API endpoints:
- `GET /health` - Server health check
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/product` - Get all products
- `GET /api/v1/category` - Get all categories
- `GET /api/v1/brand` - Get all brands

### Frontend Debugging
- React Native Debugger integration available
- Console logs show API requests/responses and connection details
- AsyncStorage inspection for token/user data persistence
- Environment variable loading visible in Expo startup logs

### Database Debugging  
```powershell
cd server-pos-api
npx prisma studio  # Visual database browser
```

## Development Workflow

1. Ensure MySQL database is running
2. Start backend server: `cd server-pos-api && npm run dev`  
3. Verify API health endpoint responds correctly
4. Check current IP: `ipconfig | Select-String "IPv4"`
5. Update KasirGO/.env with current IP if needed
6. Start frontend with cache clear: `cd KasirGO && npx expo start --clear`
7. Use physical device or emulator on same network as development machine

## Common Troubleshooting Steps

### Environment Variable Issues
When the React Native app shows old cached environment variables:

1. **Clear Expo cache**: `Remove-Item -Path ".expo" -Recurse -Force`
2. **Restart with full cache clear**: `npx expo start --clear --reset-cache`
3. **Verify env loading**: Check Expo startup logs for `env: export API_URL APP_NAME`

### Connection Problems
- Backend server must be accessible on network (0.0.0.0:8888)
- Frontend device/emulator must be on same network
- Firewall must allow traffic on port 8888
- API_URL must match current development machine IP

The system requires both admin and cashier flows with product management, transaction processing, and user authentication across mobile and API layers.