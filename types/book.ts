export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  coverImageId?: string; // Appwrite file ID for uploaded cover
  pdfUrl: string;
  description: string;
  pages: number;
  genre?: string;
  language?: string;
}
