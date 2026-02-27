import { Query } from "appwrite";
import { appwriteConfig, databases } from "../lib/appwrite";
import { Book } from "../types/book";

export const bookService = {
  // Fetch all books
  async getAllBooks(): Promise<Book[]> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.booksCollectionId,
        [Query.orderDesc("$createdAt"), Query.limit(100)],
      );

      return response.documents.map((doc: any) => ({
        id: doc.$id,
        title: doc.title,
        author: doc.author,
        description: doc.description || "",
        coverImage: doc.coverImageId
          ? this.getFileUrl(doc.coverImageId)
          : doc.coverImage || "",
        coverImageId: doc.coverImageId,
        pdfUrl: doc.pdfFileId ? this.getFileUrl(doc.pdfFileId) : "",
        pages: doc.pages || 0,
        genre: doc.genre,
        language: doc.language,
      }));
    } catch (error) {
      console.error("Error fetching books:", error);
      throw error;
    }
  },

  // Get a single book by ID
  async getBookById(bookId: string): Promise<Book | null> {
    try {
      const doc = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.booksCollectionId,
        bookId,
      );

      return {
        id: doc.$id,
        title: doc.title,
        author: doc.author,
        description: doc.description || "",
        coverImage: doc.coverImageId
          ? this.getFileUrl(doc.coverImageId)
          : doc.coverImage || "",
        coverImageId: doc.coverImageId,
        pdfUrl: doc.pdfFileId ? this.getFileUrl(doc.pdfFileId) : "",
        pages: doc.pages || 0,
        genre: doc.genre,
        language: doc.language,
      };
    } catch (error) {
      console.error("Error fetching book:", error);
      return null;
    }
  },

  // Search books by title or author
  async searchBooks(query: string): Promise<Book[]> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.booksCollectionId,
        [
          Query.or([
            Query.search("title", query),
            Query.search("author", query),
          ]),
          Query.limit(50),
        ],
      );

      return response.documents.map((doc: any) => ({
        id: doc.$id,
        title: doc.title,
        author: doc.author,
        description: doc.description || "",
        coverImage: doc.coverImageId
          ? this.getFileUrl(doc.coverImageId)
          : doc.coverImage || "",
        coverImageId: doc.coverImageId,
        pdfUrl: doc.pdfFileId ? this.getFileUrl(doc.pdfFileId) : "",
        pages: doc.pages || 0,
        genre: doc.genre,
        language: doc.language,
      }));
    } catch (error) {
      console.error("Error searching books:", error);
      throw error;
    }
  },

  // Get file URL from storage
  getFileUrl(fileId: string): string {
    return `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.storageBucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
  },

  // Get file download URL
  getFileDownloadUrl(fileId: string): string {
    return `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.storageBucketId}/files/${fileId}/download?project=${appwriteConfig.projectId}`;
  },
};
