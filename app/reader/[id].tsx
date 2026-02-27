import { Ionicons } from "@expo/vector-icons";
import { Directory, File, Paths } from "expo-file-system";
import * as LegacyFileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../constants/theme";
import { bookService } from "../../services/bookService";

export default function Reader() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (typeof id === "string") {
        try {
          const fetchedBook = await bookService.getBookById(id);
          if (fetchedBook && fetchedBook.pdfUrl) {
            setBook(fetchedBook);
          } else {
            setError(true);
          }
        } catch (err) {
          console.error("Error loading book:", err);
          setError(true);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBook();
  }, [id]);

  const openPDF = async () => {
    if (!book || !book.pdfUrl) {
      Alert.alert("Error", "PDF file not available");
      return;
    }

    try {
      setDownloading(true);

      // Create a safe file name
      const fileName = `${book.title.replace(/[^a-z0-9]/gi, "_")}.pdf`;

      // Create cache directory for PDFs
      const pdfDir = new Directory(Paths.cache, "pdfs");
      if (!pdfDir.exists) {
        pdfDir.create();
      }

      // Check if file already exists and delete it
      const targetFile = new File(pdfDir, fileName);
      if (targetFile.exists) {
        targetFile.delete();
      }

      // Download the PDF using the new API
      const downloadedFile = await File.downloadFileAsync(book.pdfUrl, pdfDir, {
        idempotent: true,
      });

      // Rename to proper filename
      if (downloadedFile.uri !== targetFile.uri) {
        downloadedFile.move(targetFile);
      }

      if (Platform.OS === "android") {
        // Android: Use IntentLauncher to open directly in PDF viewer
        const contentUri = await LegacyFileSystem.getContentUriAsync(
          targetFile.uri,
        );
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1,
          type: "application/pdf",
        });
      } else {
        // iOS: Use Linking to open directly
        const supported = await Linking.canOpenURL(targetFile.uri);
        if (supported) {
          await Linking.openURL(targetFile.uri);
        } else {
          Alert.alert("Error", "Unable to open PDF viewer on this device");
        }
      }
    } catch (err) {
      console.error("Error opening PDF:", err);
      Alert.alert("Error", "Failed to open PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    // Automatically open PDF when component loads
    if (book && !downloading && !error) {
      openPDF();
    }
  }, [book]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.statusText}>Loading book...</Text>
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.container}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={theme.colors.text.secondary}
        />
        <Text style={styles.errorText}>Unable to load PDF</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {downloading ? (
        <>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.statusText}>Opening PDF...</Text>
        </>
      ) : (
        <>
          <Ionicons
            name="document-text-outline"
            size={64}
            color={theme.colors.primary}
          />
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.subtitle}>{book.author}</Text>

          <TouchableOpacity style={styles.button} onPress={openPDF}>
            <Ionicons
              name="book-outline"
              size={24}
              color={theme.colors.text.primary}
            />
            <Text style={styles.buttonText}>Open PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    textAlign: "center",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.md,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  statusText: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
  },
  errorText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  secondaryButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  secondaryButtonText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.md,
  },
});
