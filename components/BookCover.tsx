import { Image, StyleSheet, Text, View } from "react-native";

interface BookCoverProps {
  title: string;
  author: string;
  language?: string;
  coverUrl?: string;
  width?: number;
  height?: number;
}

// Generate a consistent color based on the title
const getColorFromTitle = (title: string): string => {
  const colors = [
    "#1e3a8a", // Deep blue
    "#166534", // Deep green
    "#7c2d12", // Deep brown
    "#4c1d95", // Deep purple
    "#831843", // Deep pink
    "#134e4a", // Deep teal
    "#713f12", // Deep amber
  ];

  const hash = title
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const BookCover = ({
  title,
  author,
  language,
  coverUrl,
  width = 112,
  height = 160,
}: BookCoverProps) => {
  // If coverUrl is provided and valid, use it
  if (coverUrl && coverUrl.trim() !== "") {
    return (
      <Image
        source={{ uri: coverUrl }}
        style={{ width, height, borderRadius: 4 }}
        resizeMode="cover"
      />
    );
  }

  // Otherwise, generate a custom cover
  const backgroundColor = getColorFromTitle(title);

  return (
    <View style={[styles.container, { width, height, backgroundColor }]}>
      <View style={styles.pattern}>
        <View style={styles.ornament} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={4}>
          {title}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.author} numberOfLines={2}>
          {author}
        </Text>

        {language && (
          <View style={styles.languageBadge}>
            <Text style={styles.languageText}>{language}</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomPattern} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 4,
  },
  pattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    opacity: 0.2,
  },
  ornament: {
    width: "100%",
    height: "100%",
    borderBottomWidth: 2,
    borderBottomColor: "#ffffff",
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: "#ffffff",
    opacity: 0.5,
    marginVertical: 8,
  },
  author: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "400",
    textAlign: "center",
    opacity: 0.9,
  },
  languageBadge: {
    position: "absolute",
    bottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  languageText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "600",
  },
  bottomPattern: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
});
