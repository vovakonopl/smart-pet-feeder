import {
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from '@expo-google-fonts/nunito-sans';
import {
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bluetooth } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, useColorScheme } from 'react-native';

import Icon from '@/src/components/ui/Icon';
import Text from '@/src/components/ui/Text';
import { deviceStore } from '@/src/store/device-store';

import '@/src/lib/mqtt/polyfills';
import 'react-native-reanimated';
import '@/global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // NunitoSans
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,

    // OpenSans
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  useEffect(() => {
    deviceStore.init();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Schedule',
            headerRight: () => (
              <Link href="/device-config" asChild>
                <Pressable className="flex-row items-center gap-0.5">
                  <Text weight="semibold" className="text-lg">
                    Device Config
                  </Text>

                  <Icon
                    icon={Bluetooth}
                    size={24}
                    className="text-foreground"
                  />
                </Pressable>
              </Link>
            ),
          }}
        />

        <Stack.Screen
          name="device-config/index"
          options={{ title: 'Device Config' }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
