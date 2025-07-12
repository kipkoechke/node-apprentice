import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
  /**
   * Save an image with dynamic options for filename, folder, and processing.
   * @param file - The uploaded file.
   * @param folder - The folder where the image will be saved.
   * @param options - Options for filename and image processing.
   * @returns The relative path of the saved image.
   */
  async saveImage(
    file: Express.Multer.File,
    folder: string,
    options?: {
      userId?: string;
      index?: number;
      width?: number;
      height?: number;
      quality?: number;
    },
  ): Promise<string> {
    // Generate a dynamic filename
    const filename = this.generateFilename(folder, options);
    const uploadPath = path.join(process.cwd(), 'public', 'img', folder);

    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Start processing the image with Sharp
    let imageProcessor = sharp(file.buffer);

    // Apply resizing if width or height is specified
    if (options?.width || options?.height) {
      imageProcessor = imageProcessor.resize(options.width, options.height);
    }

    // Always set the format to JPEG and apply quality
    imageProcessor = imageProcessor.jpeg({ quality: options?.quality || 80 });

    // Save the processed image to the file system
    await imageProcessor.toFile(path.join(uploadPath, filename));

    // Return the relative path for storage in the database
    return `img/${folder}/${filename}`;
  }

  /**
   * Generate a dynamic filename based on the folder and options.
   * @param folder - The folder where the image will be saved.
   * @param options - Options for generating the filename.
   * @returns The generated filename.
   */
  private generateFilename(
    folder: string,
    options?: {
      userId?: string;
      tourId?: string;
      index?: number;
    },
  ): string {
    const timestamp = Date.now();

    if (folder === 'users' && options?.userId) {
      return `user-${options.userId}-${timestamp}.jpeg`;
    }

    if (folder === 'tours') {
      return `${folder}-${Date.now()}-${uuidv4()}.jpeg`;
    }
    const filename = `${folder}-${Date.now()}-${uuidv4()}.jpeg`;

    if (folder === 'tours' && options?.index !== undefined) {
      return `${folder}-${Date.now()}-${uuidv4()}-${options.index + 1}.jpeg`;
    }

    // Default filename
    return `${folder}-${timestamp}-${uuidv4()}.jpeg`;
  }

  /**
   * Delete a file from the file system.
   * @param filePath - The relative path of the file to delete.
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const absolutePath = path.join(process.cwd(), filePath);
      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
      }
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error);
    }
  }
}
