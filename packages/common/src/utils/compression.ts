import sharp from 'sharp';
import { logger } from './logger';

/**
 * Compress image file using Sharp
 * @param fileBuffer - Original image buffer
 * @param mimeType - Image MIME type
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1920)
 * @param quality - JPEG quality 1-100 (default: 85)
 * @returns Compressed image buffer
 */
export const compressImage = async (
  fileBuffer: Buffer,
  mimeType: string,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 85
): Promise<Buffer> => {
  try {
    const isImage = mimeType.startsWith('image/');
    if (!isImage) {
      // Not an image, return original buffer
      return fileBuffer;
    }

    const originalSize = fileBuffer.length;
    
    let compressedBuffer: Buffer;

    switch (mimeType) {
      case 'image/jpeg':
      case 'image/jpg':
        compressedBuffer = await sharp(fileBuffer)
          .resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();
        break;

      case 'image/png':
        compressedBuffer = await sharp(fileBuffer)
          .resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .png({ quality, compressionLevel: 9 })
          .toBuffer();
        break;

      case 'image/webp':
        compressedBuffer = await sharp(fileBuffer)
          .resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality })
          .toBuffer();
        break;

      case 'image/gif':
        // GIFs are typically already compressed, but we can optimize
        compressedBuffer = await sharp(fileBuffer)
          .resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .gif()
          .toBuffer();
        break;

      default:
        // For other image types, try generic compression
        compressedBuffer = await sharp(fileBuffer)
          .resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality })
          .toBuffer();
    }

    const compressedSize = compressedBuffer.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    if (compressedSize < originalSize) {
      logger.info(
        `Image compressed: ${(originalSize / 1024).toFixed(2)}KB -> ${(compressedSize / 1024).toFixed(2)}KB ` +
        `(${compressionRatio.toFixed(1)}% reduction)`
      );
      return compressedBuffer;
    } else {
      // If compression didn't help, return original
      logger.info(`Image compression didn't reduce size, using original`);
      return fileBuffer;
    }
  } catch (error) {
    logger.warn('Failed to compress image, using original:', error);
    // Return original buffer if compression fails
    return fileBuffer;
  }
};

/**
 * Compress document file (for PDFs and other documents)
 * Note: PDF compression is complex and usually already compressed
 * This function mainly validates and optimizes where possible
 * @param fileBuffer - Original file buffer
 * @param mimeType - File MIME type
 * @returns Compressed or original buffer
 */
export const compressDocument = async (
  fileBuffer: Buffer,
  mimeType: string
): Promise<Buffer> => {
  try {
    // PDFs are usually already compressed
    if (mimeType === 'application/pdf') {
      // PDFs are typically already optimized
      // We could use a PDF library here, but it's complex and PDFs are usually well-compressed
      logger.info('PDF file - using original (PDFs are typically already compressed)');
      return fileBuffer;
    }

    // Word documents (.doc, .docx) are ZIP archives internally
    // They're usually already compressed, but we can't easily recompress them
    if (
      mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      logger.info('Word document - using original (already compressed internally)');
      return fileBuffer;
    }

    // For other document types, return as-is
    return fileBuffer;
  } catch (error) {
    logger.warn('Failed to process document, using original:', error);
    return fileBuffer;
  }
};

/**
 * Compress file based on its type
 * @param fileBuffer - Original file buffer
 * @param mimeType - File MIME type
 * @param options - Compression options
 * @returns Compressed file buffer
 */
export const compressFile = async (
  fileBuffer: Buffer,
  mimeType: string,
  options?: {
    maxImageWidth?: number;
    maxImageHeight?: number;
    imageQuality?: number;
  }
): Promise<Buffer> => {
  const originalSize = fileBuffer.length;

  // Compress images
  if (mimeType.startsWith('image/')) {
    return await compressImage(
      fileBuffer,
      mimeType,
      options?.maxImageWidth,
      options?.maxImageHeight,
      options?.imageQuality
    );
  }

  // Handle documents
  if (
    mimeType === 'application/pdf' ||
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return await compressDocument(fileBuffer, mimeType);
  }

  // For other file types, return original
  logger.info(`File type ${mimeType} - no compression applied, using original`);
  return fileBuffer;
};

