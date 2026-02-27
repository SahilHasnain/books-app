const { Client, Databases, Storage, Query } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const BOOKS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_BOOKS_COLLECTION_ID;
const STORAGE_BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID;

async function deleteAllBooks() {
  try {
    console.log("🗑️  Starting deletion process...\n");

    // Fetch all books
    const response = await databases.listDocuments(
      DATABASE_ID,
      BOOKS_COLLECTION_ID,
      [Query.limit(100)],
    );

    console.log(`Found ${response.documents.length} books to delete\n`);

    let deletedDocs = 0;
    let deletedFiles = 0;

    for (const book of response.documents) {
      try {
        console.log(`📖 Processing: ${book.title}`);

        // Delete PDF file if exists
        if (book.pdfFileId) {
          try {
            await storage.deleteFile(STORAGE_BUCKET_ID, book.pdfFileId);
            console.log(`   🗑️  Deleted PDF file: ${book.pdfFileId}`);
            deletedFiles++;
          } catch (err) {
            console.log(`   ⚠️  Could not delete PDF: ${err.message}`);
          }
        }

        // Delete cover image if exists
        if (book.coverImageId) {
          try {
            await storage.deleteFile(STORAGE_BUCKET_ID, book.coverImageId);
            console.log(`   🗑️  Deleted cover image: ${book.coverImageId}`);
            deletedFiles++;
          } catch (err) {
            console.log(`   ⚠️  Could not delete cover: ${err.message}`);
          }
        }

        // Delete book document
        await databases.deleteDocument(
          DATABASE_ID,
          BOOKS_COLLECTION_ID,
          book.$id,
        );
        console.log(`   ✅ Deleted book document\n`);
        deletedDocs++;

        // Wait between deletions
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
      }
    }

    console.log("🎉 Deletion completed!");
    console.log(`\n📊 Summary:`);
    console.log(`   📄 Documents deleted: ${deletedDocs}`);
    console.log(`   📁 Files deleted: ${deletedFiles}`);
    console.log(`\n✨ You can now re-upload books with: npm run upload:books`);
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

deleteAllBooks();
