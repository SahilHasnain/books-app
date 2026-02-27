import "dotenv/config";
import { Client, Databases, Query, Storage } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

async function updateThumbnails() {
  console.log("🔍 Finding books and thumbnails...\n");

  try {
    // Get all books
    const booksResponse = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.EXPO_PUBLIC_APPWRITE_BOOKS_COLLECTION_ID,
      [Query.limit(100)],
    );

    console.log(`📚 Found ${booksResponse.documents.length} books\n`);

    // Get all files in storage
    const filesResponse = await storage.listFiles(
      process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID,
      [Query.limit(100)],
    );

    console.log(`📁 Found ${filesResponse.files.length} files in storage\n`);

    // Create a map of PDF files to thumbnail files
    const thumbnailMap = new Map();

    filesResponse.files.forEach((file) => {
      if (file.name.endsWith("_thumb.png")) {
        // Extract original PDF name
        const pdfName = file.name.replace("_thumb.png", ".pdf");
        thumbnailMap.set(pdfName, file.$id);
      }
    });

    console.log(`🖼️  Found ${thumbnailMap.size} thumbnails\n`);

    let updated = 0;
    let notFound = 0;

    // Update each book
    for (const book of booksResponse.documents) {
      console.log(`📖 Processing: ${book.title}`);

      if (!book.pdfFileId) {
        console.log(`   ⚠️  No pdfFileId found, skipping\n`);
        notFound++;
        continue;
      }

      // Find the PDF file to get its name
      try {
        const pdfFile = await storage.getFile(
          process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID,
          book.pdfFileId,
        );

        const thumbnailId = thumbnailMap.get(pdfFile.name);

        if (thumbnailId) {
          // Update book with thumbnail
          await databases.updateDocument(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.EXPO_PUBLIC_APPWRITE_BOOKS_COLLECTION_ID,
            book.$id,
            { coverImageId: thumbnailId },
          );

          console.log(`   ✅ Updated with thumbnail: ${thumbnailId}\n`);
          updated++;
        } else {
          console.log(`   ❌ No thumbnail found for: ${pdfFile.name}\n`);
          notFound++;
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}\n`);
        notFound++;
      }
    }

    console.log("🎉 Update completed!\n");
    console.log(`📊 Summary:`);
    console.log(`   ✅ Books updated: ${updated}`);
    console.log(`   ❌ Books without thumbnails: ${notFound}`);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

updateThumbnails();
