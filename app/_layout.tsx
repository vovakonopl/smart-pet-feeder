import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View } from 'react-native';

import { cn } from '@/src/lib/utils/cn';

import 'react-native-reanimated';
import '@/global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    NunitoSans: require('@/assets/fonts/NunitoSans.ttf'),
    OpenSans: require('@/assets/fonts/OpenSans.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View className={cn('size-full', colorScheme)}>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Home' }} />
          <Stack.Screen
            name="device-config/index"
            options={{ title: 'Device Config' }}
          />
        </Stack>
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
