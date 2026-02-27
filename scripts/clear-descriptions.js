const { Client, Databases, Query } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const BOOKS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_BOOKS_COLLECTION_ID;

async function clearDescriptions() {
  try {
    console.log("🧹 Clearing placeholder descriptions from database...\n");

    // Fetch all books
    const response = await databases.listDocuments(
      DATABASE_ID,
      BOOKS_COLLECTION_ID,
      [Query.limit(100)],
    );

    console.log(`Found ${response.documents.length} books\n`);

    for (const book of response.documents) {
      try {
        console.log(`📖 Processing: ${book.title}`);
        console.log(`   Current description: "${book.description}"`);

        // Update the book to remove description
        await databases.updateDocument(
          DATABASE_ID,
          BOOKS_COLLECTION_ID,
          book.$id,
          {
            description: "",
          },
        );

        console.log(`   ✅ Description cleared\n`);
      } catch (error) {
        console.error(`   ❌ Error updating ${book.title}:`, error.message);
        console.log("   Continuing with next book...\n");
      }
    }

    console.log("🎉 All descriptions cleared successfully!");
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

clearDescriptions();
