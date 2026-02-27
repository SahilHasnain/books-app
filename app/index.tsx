import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { Book } from "../types/book";

export default function Index() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
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
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks();
  };

  const renderBook = ({ item }: { item: Book }) => (
    <TouchableOpacity
      onPress={() => router.push(`/book/${item.id}`)}
      style={styles.bookCard}
    >
      <View style={styles.bookContent}>
        <BookCover
          title={item.title}
          author={item.author}
          language={item.language}
          coverUrl={item.coverImage}
          width={112}
          height={160}
        />
        <View style={styles.bookInfo}>
          <View style={styles.bookTextContainer}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.bookAuthor}>{item.author}</Text>
            {item.language && (
              <Text style={styles.bookLanguage}>{item.language}</Text>
            )}
            <Text style={styles.bookDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          {item.pages > 0 && (
            <Text style={styles.bookPages}>{item.pages} pages</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.emptyText}>No books available</Text>
        <Text style={styles.emptySubtext}>
          Check back later for new additions
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
  listContent: {
    paddingVertical: theme.spacing.md,
  },
  bookCard: {
    marginBottom: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
  },
  bookContent: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  bookInfo: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: "space-between",
  },
  bookTextContainer: {
    flex: 1,
  },
  bookTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  bookAuthor: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  bookLanguage: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.xs,
    marginBottom: theme.spacing.xs,
  },
  bookDescription: {
    color: theme.colors.text.tertiary,
    fontSize: theme.fontSize.xs,
  },
  bookPages: {
    color: theme.colors.text.muted,
    fontSize: theme.fontSize.xs,
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
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
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
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.sm,
  },
});
