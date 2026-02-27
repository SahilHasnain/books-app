import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { theme } from "../constants/theme";
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text.primary,
          headerTitleStyle: {
            fontWeight: theme.fontWeight.semibold,
          },
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "My Library",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="book/[id]"
          options={{
            title: "Book Details",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="reader/[id]"
          options={{
            title: "Reading",
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
}
