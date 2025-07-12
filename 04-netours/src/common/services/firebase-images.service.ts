import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import { initializeApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from 'firebase/storage';

@Injectable()
export class FileService {
  private storage;

  constructor() {
    // Firebase configuration
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    this.storage = getStorage(app);
  }

  async saveImage(
    file: Express.Multer.File,
    folder: string = 'uploads',
    options?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    },
  ): Promise<string> {
    try {
      // Process image with Sharp
      const filename = `${Date.now()}-${path.parse(file.originalname).name}.${
        options?.format || 'jpeg'
      }`;

      // Start with the Sharp instance
      let imageProcessor = sharp(file.buffer);

      // Apply transformations if specified
      if (options?.width || options?.height) {
        imageProcessor = imageProcessor.resize(options.width, options.height);
      }

      // Set format and quality
      let processedBuffer: Buffer;
      if (options?.format === 'jpeg' || !options?.format) {
        processedBuffer = await imageProcessor
          .jpeg({ quality: options?.quality || 80 })
          .toBuffer();
      } else if (options?.format === 'png') {
        processedBuffer = await imageProcessor
          .png({ quality: options?.quality || 80 })
          .toBuffer();
      } else if (options?.format === 'webp') {
        processedBuffer = await imageProcessor
          .webp({ quality: options?.quality || 80 })
          .toBuffer();
      } else {
        processedBuffer = await imageProcessor.toBuffer();
      }

      // Create a reference to Firebase Storage
      const filePath = `${folder}/${filename}`;
      const storageRef = ref(this.storage, filePath);

      // Upload the processed image
      await uploadBytes(storageRef, processedBuffer, {
        contentType: `image/${options?.format || 'jpeg'}`,
      });

      // Get the public URL
      const publicUrl = await getDownloadURL(storageRef);

      // Return the public URL for storage in database
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file to Firebase:', error);
      throw new Error('File upload failed');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract the file path from the URL
      // This depends on your Firebase Storage URL format
      // You might need to adjust this based on your actual URL structure
      const storage = getStorage();
      const fileRef = ref(storage, fileUrl);

      // Delete the file
      await deleteObject(fileRef);
    } catch (error) {
      // Log error but don't throw - file might already be deleted
      console.error(`Failed to delete file ${fileUrl}:`, error);
    }
  }
}
