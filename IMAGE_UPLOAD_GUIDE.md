# Product Image Upload - Implementation Guide

## What Was Implemented

Full image upload functionality for products with:
- Database schema update (image_url field)
- Backend file upload handling (multer)  - Frontend upload UI in admin panel
- Image display on public and admin pages
- Automatic image deletion on update/delete

## Database Changes

### New Column
- **image_url** (VARCHAR 500) - Stores the relative path to uploaded images

### Migration
If you have an existing database, run:
```bash
mysql -u root -p tire_auto_parts_db < backend/database/migrations/add_image_url.sql
```

Or manually run:
```sql
ALTER TABLE products ADD COLUMN image_url VARCHAR(500) AFTER description;
```

## Backend Setup

### Installed Packages
- **multer** (^1.4.5) - File upload middleware

### New Files
- `backend/middleware/upload.js` - Multer configuration
- `backend/uploads/products/` - Image storage directory

### Updated Files
- `server.js` - Added static file serving for `/uploads`
- `routes/products.js` - Added multer middleware to create/update routes
- `controllers/productController.js` - Handle file upload in create/update
- `services/productService.js` - Save/delete image URLs, cleanup old images

### Configuration
- **Max file size**: 5MB
- **Allowed formats**: JPEG, JPG, PNG, GIF, WEBP
- **Storage**: Local filesystem in `backend/uploads/products/`
- **URL format**: `/uploads/products/filename-timestamp.ext`

## Frontend Updates

### Admin Panel (Products.jsx)
- Added Image column in table with preview
- Upload component in create/edit modal
- Image preview before upload
- Remove image functionality
- FormData submission for multipart uploads

### Public Pages
- **Products.jsx**: Display product images in cards
- **ProductDetail.jsx**: Large product image display
- Fallback to 📦 emoji if no image

## How to Use

### Admin - Upload Image for Product

1. Go to **Admin → Products**
2. Click **"Add Product"** or **Edit** existing product
3. Fill in product details
4. In the **"Product Image"** section:
   - Click the upload box
   - Select an image file (max 5MB)
   - Preview will appear immediately
5. Click **"Create"** or **"Update"**

### Image Guidelines
- **Recommended size**: 800x800px or similar square ratio
- **Max file size**: 5MB
- **Formats**: JPG, PNG, GIF, WEBP
- **Tip**: Use clear, high-quality product photos on white/plain background

## API Endpoints

### Upload Image with Product
```javascript
// Create product with image
POST /api/products
Content-Type: multipart/form-data

FormData:
  - name: "Product Name"
  - sku: "PROD-001"
  - image: File
  - ...other fields
```

```javascript
// Update product with image
PUT /api/products/:id
Content-Type: multipart/form-data

FormData:
  - name: "Updated Name"
  - image: File (optional - only if changing image)
  - ...other fields
```

### Access Images
```
GET http://localhost:5000/uploads/products/filename-123456789.jpg
```

## File Structure

```
backend/
├── middleware/
│   └── upload.js               # Multer configuration
├── uploads/
│   └── products/               # Product images storage
│       ├── .gitkeep
│       └── product-*.jpg       # Uploaded images
└── database/
    └── migrations/
        └── add_image_url.sql   # Database migration

frontend/
└── src/
    └── pages/
        ├── admin/
        │   └── Products.jsx    # Admin upload UI
        └── public/
            ├── Products.jsx     # Display images in catalog
            └── ProductDetail.jsx # Display image in detail page
```

## Troubleshooting

### Images not displaying
1. Check backend is serving static files: `http://localhost:5000/uploads/products/test.jpg`
2. Verify CORS allows image requests
3. Check browser console for 404 errors
4. Ensure `image_url` is saved in database

### Upload fails
1. Check file size < 5MB
2. Verify file format (JPG/PNG/GIF/WEBP)
3. Ensure `uploads/products/` directory exists with write permissions
4. Check backend logs for multer errors

### Old images not deleted
- Images are deleted automatically when:
  - Product is deleted (soft delete)
  - Product image is replaced with new image
- Manual cleanup: Delete files from `backend/uploads/products/`

## Future Enhancements

- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] Image optimization/compression before upload
- [ ] Multiple product images (gallery)
- [ ] Image cropping/editing tools
- [ ] Bulk image upload
- [ ] CDN integration

## Security Considerations

✅ Implemented:
- File type validation
- File size limits
- Unique filenames (timestamp-based)
- Directory traversal protection

⚠️ Consider for production:
- Virus scanning
- Image validation (not just MIME type)
- Rate limiting on uploads
- Separate storage for user uploads
- CDN with signed URLs
