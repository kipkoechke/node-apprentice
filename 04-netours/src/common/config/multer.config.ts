import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

// const multerStorage = diskStorage({
//   destination: './uploads/tours',
//   filename: (req, file, callback) => {
//     const ext = file.mimetype.split('/')[1];
//     const userId = (req.user as { id: string }).id;
//     callback(null, `tour-${userId}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException('Not an image! Please upload only images.'),
      false,
    );
  }
};

export const multerOptions = {
  // For production, consider using the memoryStorage and
  // processing the images with Sharp for better quality control
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
};
