import { Link } from 'expo-router';
import { Bluetooth, Wifi } from 'lucide-react-native';
import { View } from 'react-native';

import ThemeWrapper from '@/src/components/ThemeWrapper';
import Button from '@/src/components/ui/Button';
import { Title1 } from '@/src/components/ui/titles';

export default function App() {
  return (
    <ThemeWrapper>
      <View className="flex-1 items-center justify-center bg-background">
        <Title1 className="text-primary">Hello Hello</Title1>
        <Link href="/device-config" asChild>
          <Button variant="outlined" leftIcon={Bluetooth} rightIcon={Wifi}>
            Go to Device Config
          </Button>
        </Link>
      </View>
    </ThemeWrapper>
  );
}
