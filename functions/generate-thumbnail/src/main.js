import { Client, Databases, ID, Storage } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { pdf } from "pdf-to-img";

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
    const payload =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    log("=== THUMBNAIL GENERATION STARTED ===");
    log("Raw payload: " + JSON.stringify(payload));

    // Check if this is a storage create event
    if (!payload.$id || !payload.bucketId) {
      log("❌ Invalid payload - missing $id or bucketId");
      return res.json({ success: false, message: "Invalid event payload" });
    }

    const fileId = payload.$id;
    const bucketId = payload.bucketId;
    const fileName = payload.name || "";

    log("File ID: " + fileId);
    log("Bucket ID: " + bucketId);
    log("File Name: " + fileName);

    // Only process PDF files
    if (!fileName.toLowerCase().endsWith(".pdf")) {
      log("⏭️ Skipping non-PDF file: " + fileName);
      return res.json({ success: false, message: "Not a PDF file" });
    }

    log("Processing PDF: " + fileName);

    // Download the PDF file
    const fileBuffer = await storage.getFileDownload(bucketId, fileId);

    // Generate thumbnail from first page
    log("Generating thumbnail...");
    const document = await pdf(Buffer.from(fileBuffer), { scale: 2 });
    const firstPage = await document.getPage(1);
    const thumbnail = firstPage;

    // Upload thumbnail to storage
    log("Uploading thumbnail...");
    const thumbnailId = ID.unique();
    const thumbnailFileName = fileName.replace(".pdf", "_thumb.png");

    await storage.createFile(
      bucketId,
      thumbnailId,
      InputFile.fromBuffer(thumbnail, thumbnailFileName),
    );

    log("Thumbnail created with ID: " + thumbnailId);

    // Find and update the book document
    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
    const BOOKS_COLLECTION_ID = process.env.APPWRITE_BOOKS_COLLECTION_ID;

    log("=== DATABASE UPDATE SECTION ===");
    log("DATABASE_ID: " + DATABASE_ID);
    log("BOOKS_COLLECTION_ID: " + BOOKS_COLLECTION_ID);
    log("Searching for book with pdfFileId: " + fileId);

    // Find book by pdfFileId
    const books = await databases.listDocuments(
      DATABASE_ID,
      BOOKS_COLLECTION_ID,
      [`equal("pdfFileId", "${fileId}")`],
    );

    log("Books found: " + books.documents.length);

    if (books.documents.length > 0) {
      const bookId = books.documents[0].$id;
      log("Found book ID: " + bookId);
      log("Book title: " + books.documents[0].title);
      log(
        "Current coverImageId: " +
          (books.documents[0].coverImageId || "NOT SET"),
      );

      // Update book with thumbnail
      log("Attempting to update book with coverImageId: " + thumbnailId);

      const updatedDoc = await databases.updateDocument(
        DATABASE_ID,
        BOOKS_COLLECTION_ID,
        bookId,
        {
          coverImageId: thumbnailId,
        },
      );

      log("✅ Successfully updated book document: " + bookId);
      log("New coverImageId: " + updatedDoc.coverImageId);
    } else {
      log("❌ No book document found for PDF file: " + fileId);
      log(
        "This means the pdfFileId in the database doesn't match the uploaded file ID",
      );
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
