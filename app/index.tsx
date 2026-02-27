import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BookCover } from "../components/BookCover";
import { theme } from "../constants/theme";
import { bookService } from "../services/bookService";
import { downloadService } from "../services/downloadService";
import { Book } from "../types/book";

export default function Index() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadedBooks, setDownloadedBooks] = useState<Set<string>>(
    new Set(),
  );

  const checkDownloadedBooks = (booksList: Book[]) => {
    const downloaded = new Set<string>();
    booksList.forEach((book) => {
      if (downloadService.isBookDownloaded(book.id, book.title)) {
        downloaded.add(book.id);
      }
    });
    setDownloadedBooks(downloaded);
  };

  const fetchBooks = async () => {
    try {
      setError(null);
      const fetchedBooks = await bookService.getAllBooks();
      setBooks(fetchedBooks);
      checkDownloadedBooks(fetchedBooks);
    } catch (err) {
      console.error("Error loading books:", err);
      setError("Failed to load books. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Refresh download status when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (books.length > 0) {
        checkDownloadedBooks(books);
      }
    }, [books]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks();
  };

  const renderBook = ({ item }: { item: Book }) => {
    const isDownloaded = downloadedBooks.has(item.id);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/reader/${item.id}`)}
        style={styles.bookCard}
        activeOpacity={0.7}
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
          <View
            style={[
              styles.statusBadge,
              isDownloaded ? styles.readBadge : styles.downloadBadge,
            ]}
          >
            <Ionicons
              name={
                isDownloaded ? "checkmark-circle" : "cloud-download-outline"
              }
              size={16}
              color={theme.colors.text.primary}
            />
          </View>
        </View>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {item.author}
          </Text>
          {item.language && (
            <View style={styles.languageBadge}>
              <Text style={styles.languageText}>{item.language}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading books...</Text>
      </View>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (books.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons
          name="book-outline"
          size={64}
          color={theme.colors.text.secondary}
        />
        <Text style={styles.emptyText}>No books available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <Text style={styles.headerSubtitle}>{books.length} books</Text>
      </View>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        numColumns={2}
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
    </View>
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
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    color: theme.colors.text.primary,
    fontSize: 32,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.md,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  bookCard: {
    width: "48%",
    marginBottom: theme.spacing.md,
  },
  coverContainer: {
    position: "relative",
  },
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: theme.borderRadius.full,
    padding: 6,
  },
  downloadBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.9)",
  },
  readBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.9)",
  },
  bookInfo: {
    marginTop: theme.spacing.sm,
  },
  bookTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  bookAuthor: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  languageBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  languageText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
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
