import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BookCover } from "../../components/BookCover";
import { theme } from "../../constants/theme";
import { bookService } from "../../services/bookService";
import { Book } from "../../types/book";

export default function BookDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      if (typeof id === "string") {
        const fetchedBook = await bookService.getBookById(id);
        setBook(fetchedBook);
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Book not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.coverContainer}>
        <BookCover
          title={book.title}
          author={book.author}
          language={book.language}
          coverUrl={book.coverImage}
          width={192}
          height={288}
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>

        <View style={styles.metaContainer}>
          {book.pages > 0 && (
            <View style={styles.metaItem}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={theme.colors.text.tertiary}
              />
              <Text style={styles.metaText}>{book.pages} pages</Text>
            </View>
          )}
          {book.language && (
            <View style={styles.metaItem}>
              <Ionicons
                name="language-outline"
                size={20}
                color={theme.colors.text.tertiary}
              />
              <Text style={styles.metaText}>{book.language}</Text>
            </View>
          )}
          {book.genre && (
            <View style={styles.metaItem}>
              <Ionicons
                name="bookmark-outline"
                size={20}
                color={theme.colors.text.tertiary}
              />
              <Text style={styles.metaText}>{book.genre}</Text>
            </View>
          )}
        </View>

        {book.description && (
          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>About</Text>
            <Text style={styles.aboutText}>{book.description}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.push(`/reader/${book.id}`)}
          style={styles.readButton}
          activeOpacity={0.8}
        >
          <Ionicons
            name="book-outline"
            size={24}
            color={theme.colors.text.primary}
          />
          <Text style={styles.readButtonText}>Start Reading</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  },
  coverContainer: {
    alignItems: "center",
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.sm,
  },
  author: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.lg,
    marginBottom: theme.spacing.lg,
  },
  metaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.lg,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  metaText: {
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  aboutSection: {
    marginBottom: theme.spacing.xl,
  },
  aboutTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  aboutText: {
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  readButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  readButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.lg,
  },
});
