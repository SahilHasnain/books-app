import { Client, Databases, ID, Storage } from "node-appwrite";
import InputFile from "node-appwrite/file"
import pdfThumbnail from "pdf-thumbnail";

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(
      process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
    )
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const storage = new Storage(client);

  try {
    // Parse the event payload
    const payload = JSON.parse(req.body || "{}");

    // Check if this is a storage create event
    if (!payload.$id || !payload.bucketId) {
      return res.json({ success: false, message: "Invalid event payload" });
    }

    const fileId = payload.$id;
    const bucketId = payload.bucketId;
    const fileName = payload.name || "";

    // Only process PDF files
    if (!fileName.toLowerCase().endsWith(".pdf")) {
      log("Skipping non-PDF file: " + fileName);
      return res.json({ success: false, message: "Not a PDF file" });
    }

    log("Processing PDF: " + fileName);

    // Download the PDF file
    const fileBuffer = await storage.getFileDownload(bucketId, fileId);

    // Generate thumbnail from first page
    log("Generating thumbnail...");
    const thumbnail = await pdfThumbnail(fileBuffer, {
      compress: {
        type: "JPEG",
        quality: 85,
      },
      width: 400,
      height: 600,
    });

    // Upload thumbnail to storage
    log("Uploading thumbnail...");
    const thumbnailId = ID.unique();
    const thumbnailFileName = fileName.replace(".pdf", "_thumb.jpg");

    await storage.createFile(
      bucketId,
      thumbnailId,
      InputFile.fromBuffer(thumbnail, thumbnailFileName),
    );

    log("Thumbnail created with ID: " + thumbnailId);

    // Find and update the book document
    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
    const BOOKS_COLLECTION_ID = process.env.APPWRITE_BOOKS_COLLECTION_ID;

    // Find book by pdfFileId
    const books = await databases.listDocuments(
      DATABASE_ID,
      BOOKS_COLLECTION_ID,
      [`equal("pdfFileId", "${fileId}")`],
    );

    if (books.documents.length > 0) {
      const bookId = books.documents[0].$id;

      // Update book with thumbnail
      await databases.updateDocument(DATABASE_ID, BOOKS_COLLECTION_ID, bookId, {
        coverImageId: thumbnailId,
      });

      log("Updated book document: " + bookId);
    } else {
      log("No book document found for PDF file: " + fileId);
    }

    return res.json({
      success: true,
      thumbnailId: thumbnailId,
      message: "Thumbnail generated successfully",
    });
  } catch (err) {
    error("Error generating thumbnail: " + err.message);
    return res.json({
      success: false,
      error: err.message,
    });
  }
};
