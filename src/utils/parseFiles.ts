import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfjsVersion from 'pdfjs-dist/package.json';

// Set the workerSrc for pdfjs
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion.version}/pdf.worker.min.js`;

export async function parseFiles(files: File[]): Promise<string> {
  const results: string[] = [];

  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      results.push(await parsePDF(file));
    } else if (ext === 'docx') {
      results.push(await parseDocx(file));
    } else if (ext === 'xlsx') {
      results.push(await parseXlsx(file));
    } else {
      results.push('');
    }
  }

  return results.filter(Boolean).join('\n\n');
}

async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text;
}

async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value;
}

async function parseXlsx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  let text = '';
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    text += csv + '\n';
  });
  return text;
} 