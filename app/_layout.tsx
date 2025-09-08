import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme, View } from "react-native";
import { cn } from "@/utils/cn";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    NunitoSans: require("@/assets/fonts/NunitoSans.ttf"),
    OpenSans: require("@/assets/fonts/OpenSans.ttf"),
  });

  console.log(colorScheme);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View className={cn("size-full", colorScheme)}>
        <Slot />
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
