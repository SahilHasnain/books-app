const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const BOOKS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_BOOKS_COLLECTION_ID;

async function clearDummyCovers() {
  try {
    console.log("🧹 Clearing dummy cover images...\n");

    // Get all books
    const response = await databases.listDocuments(
      DATABASE_ID,
      BOOKS_COLLECTION_ID,
    );

    console.log(`Found ${response.documents.length} books\n`);

    for (const doc of response.documents) {
      try {
        // Check if coverImage contains picsum.photos (dummy URL)
        if (doc.coverImage && doc.coverImage.includes("picsum.photos")) {
          console.log(`📖 Updating: ${doc.title}`);

          // Update the document to remove the dummy cover
          await databases.updateDocument(
            DATABASE_ID,
            BOOKS_COLLECTION_ID,
            doc.$id,
            {
              coverImage: "", // Clear the dummy URL
            },
          );

          console.log(`   ✅ Cleared dummy cover\n`);

          // Wait a bit between updates
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          console.log(`📖 ${doc.title} - No dummy cover to clear`);
        }
      } catch (error) {
        console.error(`   ❌ Error updating ${doc.title}:`, error.message);
      }
    }

    console.log("\n🎉 Done! All dummy covers cleared.");
    console.log("The app will now show the beautiful generated covers.");
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

clearDummyCovers();
