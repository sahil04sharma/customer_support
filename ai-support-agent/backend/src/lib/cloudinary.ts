import { v2 as cloudinary } from 'cloudinary';
import cuid from 'cuid';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  apiKey: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

function safePublicId(businessId: string, filename: string): string {
  const base = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${businessId}/${base}-${cuid().slice(0, 8)}`;
}

export async function uploadDocument(
  buffer: Buffer,
  filename: string,
  businessId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'ai-support-agent/documents',
        public_id: safePublicId(businessId, filename),
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function uploadWidgetImage(
  buffer: Buffer,
  filename: string,
  businessId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'ai-support-agent/widget',
        public_id: safePublicId(businessId, filename),
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
