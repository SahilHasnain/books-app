import { LanguageFilter } from "@/components/LanguageFilter";
import { Ionicons } from "@expo/vector-icons";
import { Directory, File as FSFile, Paths } from "expo-file-system";
import * as LegacyFileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookCover } from "../components/BookCover";
import { theme } from "../constants/theme";
import { bookService } from "../services/bookService";
import { Book } from "../types/book";

export default function Index() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [openingPDF, setOpeningPDF] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      setError(null);
      const fetchedBooks = await bookService.getAllBooks();
      setBooks(fetchedBooks);
    } catch (err) {
      console.error("Error loading books:", err);
      setError("Failed to load books. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Refresh download status when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Refresh books when screen comes into focus
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks();
  };

  // Extract unique languages from books
  const availableLanguages = useMemo(() => {
    const languages = books
      .map((book) => book.language)
      .filter((lang): lang is string => !!lang);
    return Array.from(new Set(languages)).sort();
  }, [books]);

  // Filter books by selected language
  const filteredBooks = useMemo(() => {
    if (!selectedLanguage) return books;
    return books.filter((book) => book.language === selectedLanguage);
  }, [books, selectedLanguage]);

  const openPDF = async (book: Book) => {
    if (!book.pdfUrl) {
      Alert.alert("Error", "PDF file not available");
      return;
    }

    try {
      setOpeningPDF(book.id);

      const fileName = `${book.title.replace(/[^a-z0-9]/gi, "_")}.pdf`;
      const pdfDir = new Directory(Paths.cache, "pdfs");
      if (!pdfDir.exists) {
        pdfDir.create();
      }

      const targetFile = new FSFile(pdfDir, fileName);

      // If file exists, open it directly
      if (targetFile.exists) {
        await openPDFFile(targetFile);
        setOpeningPDF(null);
        return;
      }

      // Delete existing file if present
      if (targetFile.exists) {
        targetFile.delete();
      }

      // Download the PDF
      const downloadedFile = await FSFile.downloadFileAsync(
        book.pdfUrl,
        pdfDir,
        {
          idempotent: true,
        },
      );

      // Rename to proper filename
      if (downloadedFile.uri !== targetFile.uri) {
        downloadedFile.move(targetFile);
      }

      await openPDFFile(targetFile);
    } catch (err) {
      console.error("Error opening PDF:", err);
      Alert.alert("Error", "Failed to open PDF. Please try again.");
    } finally {
      setOpeningPDF(null);
    }
  };

  const openPDFFile = async (file: FSFile) => {
    if (Platform.OS === "android") {
      const contentUri = await LegacyFileSystem.getContentUriAsync(file.uri);
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: contentUri,
        flags: 1,
        type: "application/pdf",
      });
    } else {
      const supported = await Linking.canOpenURL(file.uri);
      if (supported) {
        await Linking.openURL(file.uri);
      } else {
        Alert.alert("Error", "Unable to open PDF viewer on this device");
      }
    }
  };

  const renderBook = ({ item }: { item: Book }) => {
    const isOpening = openingPDF === item.id;

    return (
      <TouchableOpacity
        onPress={() => openPDF(item)}
        style={styles.bookCard}
        activeOpacity={0.7}
        disabled={isOpening}
      >
        <View style={styles.coverContainer}>
          <BookCover
            title={item.title}
            author={item.author}
            language={item.language}
            coverUrl={item.coverImage}
            width={140}
            height={200}
          />
          {isOpening && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.author}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    if (availableLanguages.length === 0) return null;

    return (
      <View style={styles.filterContainer}>
        <LanguageFilter
          languages={availableLanguages}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading books...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.centerContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBooks}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (books.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.centerContainer}>
          <Ionicons
            name="book-outline"
            size={64}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.emptyText}>No books available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={filteredBooks}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  filterContainer: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: theme.spacing.xl,
  },
  bookCard: {
    width: "48%",
  },
  coverContainer: {
    position: "relative",
    marginBottom: theme.spacing.sm,
    borderRadius: 8,
    overflow: "hidden",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  bookTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    lineHeight: 20,
    marginBottom: 4,
  },
  bookAuthor: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.sm,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
  },
  errorText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.md,
    textAlign: "center",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  retryButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  emptyText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginTop: theme.spacing.md,
  },
});
