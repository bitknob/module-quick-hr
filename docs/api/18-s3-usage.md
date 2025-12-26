# AWS S3 Usage and Free Tier Optimization

[← Back to API Documentation Index](./README.md)

## AWS S3 Free Tier Limits

The system is optimized to work within AWS S3 Free Tier limits. The following limits apply **per month** for accounts less than 12 months old:

### Free Tier Limits:
- **Storage:** 5 GB of standard storage
- **PUT Requests:** 2,000 requests (uploads, copies, posts)
- **GET Requests:** 20,000 requests (downloads, retrievals)
- **Data Transfer Out:** 15 GB of data transfer out to the internet

### Important Notes:
- Free tier is available for **12 months** from AWS account creation date
- Limits are **per month** and reset at the start of each month
- Limits apply **across all regions** collectively, not per region
- After free tier expires, standard AWS S3 pricing applies

## System Optimizations

### Automatic File Compression
The system automatically compresses files before uploading to S3 to reduce storage usage:

- **Images:** Compressed using Sharp library
  - JPEG/PNG/WebP: Resized to max 1920x1920px, quality optimized to 85%
  - Automatic format optimization
  - Typical compression: 30-70% size reduction
  
- **PDFs:** Already compressed format, used as-is
- **Word Documents:** Already compressed (ZIP-based), used as-is
- **Other Files:** Used as-is

**Benefits:**
- Reduces storage costs
- Faster upload/download times
- Better utilization of free tier limits
- Compression ratio logged for monitoring

### File Size Limits
- **Maximum file size:** 2MB per file (before compression)
- **Rationale:** Client-side limit of 2MB ensures fast uploads and better user experience
- After compression, files are typically 30-70% smaller, allowing more files within the 5GB free tier
- With 2MB limit and compression, approximately 2,500-5,000 files can fit in 5GB storage
- Files exceeding 2MB will be rejected with an error message
- **Automatic Compression:** Files are automatically compressed before upload to reduce storage usage

### Storage Structure
- **Documents:** Stored in `s3://quick-hr/documents/`
- **Images:** Stored in `s3://quick-hr/images/`
- Files are stored with unique UUID-based filenames to prevent conflicts

### Cost Optimization Features
1. **Automatic file deletion:** When documents are deleted, files are removed from S3 to free up storage
2. **Usage tracking:** System tracks uploads and provides warnings when approaching limits
3. **Standard storage class:** Uses STANDARD storage class (covered by free tier)
4. **Public access:** Files are set to public-read for direct URL access (no additional GET requests for serving)

## Usage Monitoring

The system includes built-in usage monitoring that:
- Tracks storage usage (in GB)
- Tracks PUT requests (uploads)
- Tracks GET requests (downloads/accesses)
- Tracks data transfer out
- Provides warnings when usage exceeds 80% of free tier limits
- Resets monthly usage tracking automatically

### Usage Statistics

You can check current usage through the system logs. The system logs usage information with each upload:

```
S3 Usage - PUT Requests: 150/2000, Storage: 0.75GB/5GB
```

When approaching limits (80%+), warnings are logged:

```
S3 Free Tier Usage Warning - PUT Requests: 1600/2000 (80.0%), Storage: 4.0GB/5GB (80.0%)
```

## Best Practices for Free Tier

1. **Monitor file sizes:** Keep individual files under 5MB
2. **Delete unused files:** Regularly clean up old or unnecessary documents
3. **Optimize images:** Compress images before upload to reduce storage
4. **Batch operations:** Minimize unnecessary GET requests by caching URLs
5. **Set up billing alerts:** Configure AWS billing alerts to monitor usage

## Estimating Usage

### Storage Calculation:
- Maximum file size (before compression): 2MB
- Average document size (before compression): ~1-2MB
- Average document size (after compression): ~0.5-1.5MB (images), ~1-2MB (PDFs)
- With 5GB limit: ~3,300-10,000 documents (with compression)
- With 2MB limit per file: ~2,500 documents maximum (before compression)
- **Compression typically saves 30-70% storage for images**

### Request Calculation:
- Each document upload = 1 PUT request
- Each document view/download = 1 GET request
- With 2,000 PUT limit: ~2,000 document uploads per month
- With 20,000 GET limit: ~20,000 document views per month

### Data Transfer Calculation:
- Each document download = file size in data transfer
- With 15GB limit: ~3,000 downloads of 5MB files, or ~7,500 downloads of 2MB files

## Migration from Firebase Storage

The system has been migrated from Firebase Storage to AWS S3 for:
- Better cost control with free tier
- More predictable pricing
- Better integration with AWS ecosystem
- Improved performance in ap-south-1 region

## After Free Tier Expires

When the 12-month free tier period expires, standard AWS S3 pricing applies:

- **Storage:** ~$0.023 per GB/month (Standard storage)
- **PUT Requests:** ~$0.005 per 1,000 requests
- **GET Requests:** ~$0.0004 per 1,000 requests
- **Data Transfer Out:** ~$0.09 per GB (first 10TB)

**Example monthly cost for typical usage:**
- 5GB storage: ~$0.12/month
- 2,000 PUT requests: ~$0.01/month
- 20,000 GET requests: ~$0.008/month
- 15GB data transfer: ~$1.35/month
- **Total: ~$1.50/month** (after free tier)

## Configuration

S3 configuration is managed through environment variables:

```env
S3_BUCKET_NAME=quick-hr
S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BASE_URL=https://quick-hr.s3.ap-south-1.amazonaws.com
```

## Recommendations

1. **Set up AWS CloudWatch alarms** to monitor S3 usage
2. **Enable S3 lifecycle policies** to automatically delete old files
3. **Use S3 Intelligent-Tiering** after free tier expires for automatic cost optimization
4. **Consider S3 Glacier** for long-term archival of old documents
5. **Implement file compression** for large documents before upload

