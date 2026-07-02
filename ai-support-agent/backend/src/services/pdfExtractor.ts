import pdfParse from 'pdf-parse';
import { AppError } from '../middleware/error.middleware';

export async function extractText(buffer: Buffer, mimetype: string): Promise<string> {
  let text = '';

  if (mimetype === 'application/pdf') {
    const parsed = await pdfParse(buffer);
    text = parsed.text;
  } else if (mimetype === 'text/plain') {
    text = buffer.toString('utf-8');
  } else {
    throw new AppError(400, 'Unsupported file type. Upload a PDF or TXT file.');
  }

  if (!text.trim()) {
    throw new AppError(400, 'File contains no readable text.');
  }

  return text;
}
