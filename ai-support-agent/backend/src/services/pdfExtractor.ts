import pdfParse from 'pdf-parse';
import { AppError } from '../middleware/error.middleware';

export async function extractText(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === 'application/pdf') {
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }

  if (mimetype === 'text/plain') {
    return buffer.toString('utf-8');
  }

  throw new AppError(400, 'Unsupported file type. Upload a PDF or TXT file.');
}
