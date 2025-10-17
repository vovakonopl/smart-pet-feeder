import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/nativewindui/Text';
import ThemeWrapper from '@/src/components/ThemeWrapper';

export default function App() {
  return (
    <ThemeWrapper>
      <View className="flex-1 items-center justify-center bg-background">
        <Text variant="title1" className="text-primary">
          Hello Hello
        </Text>
        <Link href="/device-config" asChild>
          <Pressable className="rounded-xl border px-4 py-3">
            <Text className="font-semibold">Go to Device Config</Text>
          </Pressable>
        </Link>
      </View>
    </ThemeWrapper>
  );
}
