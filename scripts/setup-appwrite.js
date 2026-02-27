const {
  Client,
  Databases,
  Storage,
  ID,
  Permission,
  Role,
} = require("node-appwrite");
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

async function setupAppwrite() {
  try {
    console.log("🚀 Starting Appwrite setup...\n");

    // Create Database
    console.log("📦 Creating database...");
    try {
      await databases.create(DATABASE_ID, "Books Database");
      console.log("✅ Database created successfully\n");
    } catch (error) {
      if (error.code === 409) {
        console.log("ℹ️  Database already exists\n");
      } else {
        throw error;
      }
    }

    // Create Books Collection
    console.log("📚 Creating books collection...");
    try {
      await databases.createCollection(
        DATABASE_ID,
        BOOKS_COLLECTION_ID,
        "Books",
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
      );
      console.log("✅ Books collection created successfully\n");
    } catch (error) {
      if (error.code === 409) {
        console.log("ℹ️  Books collection already exists\n");
      } else {
        throw error;
      }
    }

    // Create Attributes for Books Collection
    console.log("🔧 Creating collection attributes...");

    const attributes = [
      { key: "title", type: "string", size: 255, required: true },
      { key: "author", type: "string", size: 255, required: true },
      { key: "description", type: "string", size: 1000, required: false },
      { key: "coverImage", type: "string", size: 500, required: false },
      { key: "pdfFileId", type: "string", size: 255, required: false },
      { key: "pages", type: "integer", required: false },
      { key: "publishedYear", type: "integer", required: false },
      { key: "genre", type: "string", size: 100, required: false },
      { key: "language", type: "string", size: 50, required: false },
    ];

    for (const attr of attributes) {
      try {
        if (attr.type === "string") {
          await databases.createStringAttribute(
            DATABASE_ID,
            BOOKS_COLLECTION_ID,
            attr.key,
            attr.size,
            attr.required,
          );
        } else if (attr.type === "integer") {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            BOOKS_COLLECTION_ID,
            attr.key,
            attr.required,
          );
        }
        console.log(`  ✅ Created attribute: ${attr.key}`);
        // Wait a bit between attribute creations
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.code === 409) {
          console.log(`  ℹ️  Attribute ${attr.key} already exists`);
        } else {
          console.log(`  ⚠️  Error creating ${attr.key}: ${error.message}`);
        }
      }
    }
    console.log("\n");

    // Create Indexes
    console.log("📇 Creating indexes...");
    try {
      await databases.createIndex(
        DATABASE_ID,
        BOOKS_COLLECTION_ID,
        "title_index",
        "key",
        ["title"],
        ["asc"],
      );
      console.log("  ✅ Created index: title_index");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      if (error.code === 409) {
        console.log("  ℹ️  Index title_index already exists");
      }
    }

    try {
      await databases.createIndex(
        DATABASE_ID,
        BOOKS_COLLECTION_ID,
        "author_index",
        "key",
        ["author"],
        ["asc"],
      );
      console.log("  ✅ Created index: author_index");
    } catch (error) {
      if (error.code === 409) {
        console.log("  ℹ️  Index author_index already exists");
      }
    }
    console.log("\n");

    // Create Storage Bucket
    console.log("🗄️  Creating storage bucket...");
    try {
      await storage.createBucket(
        STORAGE_BUCKET_ID,
        "Books Storage",
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
        false, // fileSecurity
        true, // enabled
        100 * 1024 * 1024, // 100MB max file size
        ["application/pdf", "image/jpeg", "image/png", "image/jpg"], // allowed file extensions
        "none", // compression
        false, // encryption
        false, // antivirus
      );
      console.log("✅ Storage bucket created successfully\n");
    } catch (error) {
      if (error.code === 409) {
        console.log("ℹ️  Storage bucket already exists\n");
      } else {
        throw error;
      }
    }

    console.log("🎉 Appwrite setup completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`   Database ID: ${DATABASE_ID}`);
    console.log(`   Collection ID: ${BOOKS_COLLECTION_ID}`);
    console.log(`   Storage Bucket ID: ${STORAGE_BUCKET_ID}`);
    console.log("\n✨ You can now start using your app!");
  } catch (error) {
    console.error("❌ Error during setup:", error.message);
    console.error(error);
    process.exit(1);
  }
}

setupAppwrite();
