import { Ionicons } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../constants/theme";

interface LanguageFilterProps {
  languages: string[];
  selectedLanguage: string | null;
  onSelectLanguage: (language: string | null) => void;
}

export function LanguageFilter({
  languages,
  selectedLanguage,
  onSelectLanguage,
}: LanguageFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.filterPill,
            selectedLanguage === null && styles.filterPillActive,
          ]}
          onPress={() => onSelectLanguage(null)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="apps-outline"
            size={16}
            color={
              selectedLanguage === null
                ? theme.colors.text.primary
                : theme.colors.text.secondary
            }
            style={styles.icon}
          />
          <Text
            style={[
              styles.filterText,
              selectedLanguage === null && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {languages.map((language) => (
          <TouchableOpacity
            key={language}
            style={[
              styles.filterPill,
              selectedLanguage === language && styles.filterPillActive,
            ]}
            onPress={() => onSelectLanguage(language)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                selectedLanguage === language && styles.filterTextActive,
              ]}
            >
              {language}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
  },
  scrollContent: {
    gap: theme.spacing.sm,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  icon: {
    marginRight: theme.spacing.xs,
  },
  filterText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  filterTextActive: {
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});
