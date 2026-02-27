import { Directory, File, Paths } from "expo-file-system";

export const downloadService = {
  // Check if a book is downloaded
  isBookDownloaded(bookId: string, title: string): boolean {
    try {
      const fileName = `${title.replace(/[^a-z0-9]/gi, "_")}.pdf`;
      const pdfDir = new Directory(Paths.cache, "pdfs");

      if (!pdfDir.exists) {
        return false;
      }

      const file = new File(pdfDir, fileName);
      return file.exists;
    } catch (error) {
      console.error("Error checking download status:", error);
      return false;
    }
  },

  // Get the file path for a downloaded book
  getDownloadedFilePath(title: string): string {
    const fileName = `${title.replace(/[^a-z0-9]/gi, "_")}.pdf`;
    const pdfDir = new Directory(Paths.cache, "pdfs");
    const file = new File(pdfDir, fileName);
    return file.uri;
  },
};
