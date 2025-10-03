# 📸 Cloudinary Setup Guide

## 🎯 Overview
This project uses **Cloudinary** for cloud-based image storage and management. All product images are automatically uploaded to Cloudinary with optimization.

---

## 🚀 Quick Setup

### 1. Create Cloudinary Account (FREE)

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up with your email (atau pake Google/GitHub)
3. Verify your email

### 2. Get API Credentials

After login, you'll see your **Dashboard**:

```
Cloud Name: xxxxx
API Key: 123456789012345
API Secret: xxxxxxxxxxxxxxxxxxxxx
```

**Copy these 3 values!** ⚠️

### 3. Update Backend `.env`

Add to your `server-pos-api/.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=kasirgo-demo
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnop_qrstuvwxyz
```

### 4. Restart Backend Server

```bash
cd server-pos-api
npm run dev
```

You should see:
```
✅ Cloudinary connected successfully
```

---

## 📁 How It Works

### Image Upload Flow

1. **Frontend** → Sends `multipart/form-data` with image file
2. **Multer Middleware** → Validates file (type, size)
3. **Cloudinary Storage** → Uploads & optimizes image
4. **Database** → Stores Cloudinary URL
5. **Frontend** → Displays image from Cloudinary CDN

### Automatic Optimizations

✅ **Auto-resize**: Max 800x800px (maintains aspect ratio)  
✅ **Auto-format**: Converts to most efficient format (WebP, AVIF)  
✅ **Auto-quality**: Reduces quality intelligently  
✅ **CDN**: Fast loading from nearest server  

### File Restrictions

- **Max Size**: 5MB
- **Formats**: JPG, JPEG, PNG, WebP, GIF
- **Field Name**: `image` (single file)

---

## 🧪 Testing

### Test with Postman/Thunder Client

#### 1. Create Product with Image

```http
POST http://localhost:8888/api/v1/product
Authorization: Bearer YOUR_ACCESS_TOKEN

Body: form-data
- name: "Coca Cola"
- description: "Minuman soda"
- price: 5000
- stock: 100
- categoryId: 1
- brandId: 1
- image: [SELECT FILE] ← Upload image here
```

#### 2. Update Product Image

```http
PUT http://localhost:8888/api/v1/product/1
Authorization: Bearer YOUR_ACCESS_TOKEN

Body: form-data
- image: [SELECT NEW FILE]
```

### Expected Response

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Coca Cola",
    "image": "https://res.cloudinary.com/kasirgo-demo/image/upload/v1234567890/pos-mobile/products/abc123.jpg",
    ...
  }
}
```

---

## 📱 Frontend Integration (React Native)

### Create Product with Image

```typescript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    uploadProduct(result.assets[0]);
  }
};

const uploadProduct = async (image) => {
  const formData = new FormData();
  formData.append('name', 'Coca Cola');
  formData.append('price', '5000');
  formData.append('stock', '100');
  formData.append('categoryId', '1');
  formData.append('brandId', '1');
  
  // Append image
  formData.append('image', {
    uri: image.uri,
    type: 'image/jpeg',
    name: 'product.jpg',
  } as any);

  const response = await api.post('/product', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  console.log('Product created:', response.data);
};
```

---

## 🔍 Cloudinary Dashboard Features

### View Uploaded Images

1. Go to [https://cloudinary.com/console/media_library](https://cloudinary.com/console/media_library)
2. Navigate to `pos-mobile/products/` folder
3. See all uploaded product images

### Check Usage

1. Go to **Dashboard** → **Usage**
2. See:
   - Storage used
   - Bandwidth consumed
   - Transformations used

### Free Tier Limits

- ✅ **25 Credits/month** (≈ 25GB bandwidth)
- ✅ **25GB Storage**
- ✅ **Unlimited transformations**

**For POS app**, ini lebih dari cukup! 🎉

---

## 🐛 Troubleshooting

### Issue 1: "Cloudinary connection failed"

**Solution:**
1. Check `.env` credentials are correct
2. Make sure no extra spaces in values
3. Restart server

### Issue 2: "Only image files are allowed"

**Solution:**
- Only upload JPG, PNG, WebP, GIF files
- Check MIME type is `image/*`

### Issue 3: "File size is too large"

**Solution:**
- Max file size is 5MB
- Compress image before upload
- Or increase limit in `upload.middleware.js` (line 38)

### Issue 4: Image not showing in app

**Solution:**
1. Check Cloudinary URL in database
2. Make sure URL starts with `https://res.cloudinary.com/`
3. Test URL directly in browser

---

## 🔐 Security Notes

⚠️ **NEVER commit `.env` to Git!**

```bash
# Make sure .env is in .gitignore
echo ".env" >> .gitignore
```

✅ **For Railway deployment**, add env vars in Railway dashboard:
- Settings → Variables → Add all Cloudinary credentials

---

## 💰 Cost Estimation (FREE tier)

For a small POS business:

- **100 products** with images = ~50MB storage
- **1000 views/day** = ~5GB/month bandwidth
- **Result**: Still within FREE tier! 🎉

**Upgrade needed if:**
- More than 500 products
- High traffic (10k+ views/day)
- Need advanced features (AI tagging, video, etc.)

---

## 📚 Additional Resources

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Image Optimization](https://cloudinary.com/documentation/image_optimization)

---

## ✨ Benefits vs Alternatives

| Feature | Cloudinary | AWS S3 | Local Storage |
|---------|-----------|---------|---------------|
| **Free Tier** | 25GB bandwidth | 5GB (12 months) | Unlimited |
| **Setup Time** | 5 minutes | 30+ minutes | 0 minutes |
| **Auto Optimization** | ✅ Yes | ❌ No | ❌ No |
| **CDN** | ✅ Built-in | Extra cost | ❌ No |
| **Transformations** | ✅ Free | Extra cost | Manual |
| **Maintenance** | ✅ Zero | Medium | High |
| **Railway Compatible** | ✅ Perfect | ✅ Yes | ⚠️ Risky |

**Verdict**: Cloudinary is the best choice for this project! 🏆

---

## 🎉 You're All Set!

Now you can:
- ✅ Upload product images from mobile app
- ✅ Auto-optimize images for fast loading
- ✅ Serve images via CDN
- ✅ Deploy to Railway without worry

Happy coding! 🚀
