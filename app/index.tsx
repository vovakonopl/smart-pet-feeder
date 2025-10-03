import { View } from 'react-native';

import { Text } from '@/components/nativewindui/Text';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text variant="title1" className="text-primary/50">
        Hello Hello
      </Text>
    </View>
  );
}
