const { Client, Databases, Storage, ID } = require("node-appwrite");
const { InputFile } = require("node-appwrite/file");
const fs = require("fs");
const path = require("path");
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

// Book metadata
const booksMetadata = {
  "432- Adawlatul Makkiya.pdf": {
    title: "Adawlatul Makkiya",
    author: "Imam Ahmad Raza Khan",
    description:
      "A comprehensive Islamic text on religious practices and guidance",
    genre: "Islamic Literature",
    language: "Urdu",
  },
  "436- Anwaarul Hadeees (Roman Urdu).pdf": {
    title: "Anwaarul Hadeees",
    author: "Various Scholars",
    description: "Collection of Hadith with commentary in Roman Urdu",
    genre: "Hadith",
    language: "Roman Urdu",
  },
  "aakhri-nabi-ki-piyari-seerat (1).pdf": {
    title: "Aakhri Nabi Ki Piyari Seerat",
    author: "Islamic Scholar",
    description: "Biography of the Last Prophet Muhammad (PBUH)",
    genre: "Biography",
    language: "Urdu",
  },
  "addawalatul-makkiyah-urdu.pdf": {
    title: "Addawalatul Makkiyah",
    author: "Imam Ahmad Raza Khan",
    description: "Islamic guidance and religious practices",
    genre: "Islamic Literature",
    language: "Urdu",
  },
  "ahadees-e-mubarka-kay-anwaar.pdf": {
    title: "Ahadees-e-Mubarka Kay Anwaar",
    author: "Various Scholars",
    description: "Lights of the blessed Hadith",
    genre: "Hadith",
    language: "Urdu",
  },
  "ash-shifa-shareef-of-qadi-iyad-ibn-musa-al-yahsubi-radi-allahu-anhu.pdf": {
    title: "Ash-Shifa Shareef",
    author: "Qadi Iyad ibn Musa al-Yahsubi",
    description:
      "The healing through the recognition of the rights of the Chosen One",
    genre: "Islamic Literature",
    language: "Arabic",
  },
  "Hadaiq-e-Bakhshish-eng.pdf": {
    title: "Hadaiq-e-Bakhshish",
    author: "Imam Ahmad Raza Khan",
    description: "Gardens of Bounties - Collection of Naats",
    genre: "Poetry",
    language: "English",
  },
  "Ikhteyarate Mustafa (Roman).pdf": {
    title: "Ikhteyarate Mustafa",
    author: "Islamic Scholar",
    description: "The Choices of the Chosen One",
    genre: "Islamic Literature",
    language: "Roman Urdu",
  },
  "mukashafa-tul-quloob.pdf": {
    title: "Mukashafa-tul-Quloob",
    author: "Imam Ghazali",
    description: "Unveiling of the Hearts - Spiritual guidance",
    genre: "Spirituality",
    language: "Urdu",
  },
  "seerat-e-mustafa.pdf": {
    title: "Seerat-e-Mustafa",
    author: "Islamic Scholar",
    description: "Biography of Prophet Muhammad (PBUH)",
    genre: "Biography",
    language: "Urdu",
  },
  "Shifa Shareef (1) Urdu.pdf": {
    title: "Shifa Shareef (Urdu)",
    author: "Qadi Iyad",
    description: "The healing - Urdu translation",
    genre: "Islamic Literature",
    language: "Urdu",
  },
  "Shifa Shareef (Roman Urdu) - Ebook.pdf": {
    title: "Shifa Shareef (Roman Urdu)",
    author: "Qadi Iyad",
    description: "The healing - Roman Urdu translation",
    genre: "Islamic Literature",
    language: "Roman Urdu",
  },
};

async function updateBucketSettings() {
  try {
    console.log("🔧 Updating storage bucket settings to allow PDF files...");
    await storage.updateBucket(
      STORAGE_BUCKET_ID,
      "Books Storage",
      undefined, // permissions
      undefined, // fileSecurity
      true, // enabled
      100 * 1024 * 1024, // 100MB max file size
      ["pdf", "jpg", "jpeg", "png"], // allowed file extensions (without dot)
      "none", // compression
      false, // encryption
      false, // antivirus
    );
    console.log("✅ Bucket settings updated\n");
  } catch (error) {
    console.log("⚠️  Could not update bucket settings:", error.message);
    console.log("   Continuing anyway...\n");
  }
}

async function uploadBooks() {
  try {
    console.log("📚 Starting book upload process...\n");

    // First, update bucket settings
    await updateBucketSettings();

    const booksDir = path.join(__dirname, "../assets/books");
    const files = fs
      .readdirSync(booksDir)
      .filter((file) => file.endsWith(".pdf"));

    console.log(`Found ${files.length} PDF files to upload\n`);

    for (const file of files) {
      try {
        console.log(`📖 Processing: ${file}`);

        const filePath = path.join(booksDir, file);
        const fileSize = fs.statSync(filePath).size;
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

        console.log(`   Size: ${fileSizeMB} MB`);

        // Skip files larger than 50MB
        if (fileSize > 50 * 1024 * 1024) {
          console.log(`   ⚠️  Skipping - file too large (max 50MB)\n`);
          continue;
        }

        // Upload PDF to storage using InputFile
        console.log("   ⬆️  Uploading PDF to storage...");
        const fileId = ID.unique();

        const uploadedFile = await storage.createFile(
          STORAGE_BUCKET_ID,
          fileId,
          InputFile.fromPath(filePath, file),
        );

        console.log(`   ✅ PDF uploaded with ID: ${fileId}`);

        // Get metadata or use defaults
        const metadata = booksMetadata[file] || {
          title: file.replace(".pdf", ""),
          author: "Unknown",
          description: "Islamic literature",
          genre: "Islamic Literature",
          language: "Urdu",
        };

        // Create document in database
        console.log("   💾 Creating database entry...");
        const document = await databases.createDocument(
          DATABASE_ID,
          BOOKS_COLLECTION_ID,
          ID.unique(),
          {
            title: metadata.title,
            author: metadata.author,
            description: metadata.description,
            pdfFileId: fileId,
            genre: metadata.genre,
            language: metadata.language,
            coverImage: `https://picsum.photos/seed/${fileId}/400/600`,
            pages: 0,
          },
        );

        console.log(`   ✅ Database entry created with ID: ${document.$id}`);
        console.log("   ✨ Book uploaded successfully!\n");

        // Wait between uploads
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`   ❌ Error uploading ${file}:`, error.message);
        console.log("   Continuing with next file...\n");
      }
    }

    console.log("🎉 Book upload process completed!");
    console.log(`\n📊 Check your Appwrite console to see the uploaded books.`);
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

uploadBooks();
