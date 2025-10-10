import {
  WIFI_PASSWORD_CHAR_SUFFIX,
  WIFI_SSID_CHAR_SUFFIX,
} from '@/src/lib/constants/gatt-read-characteristics';

import type { Device, Characteristic, Service } from 'react-native-ble-plx';

export type GattData = {
  service: Service;
  ssidWriteChar: Characteristic;
  passwordWriteChar: Characteristic;
  deviceIdReadChar: Characteristic;
  notifyChar: Characteristic;
};

function findWriteChars(
  chars: Characteristic[],
): Partial<Pick<GattData, 'passwordWriteChar' | 'ssidWriteChar'>> {
  let ssidWriteChar: Characteristic | undefined = chars.find((char) =>
    char.uuid.toLowerCase().endsWith(WIFI_SSID_CHAR_SUFFIX.toLowerCase()),
  );
  let passwordWriteChar: Characteristic | undefined = chars.find((char) =>
    char.uuid.toLowerCase().endsWith(WIFI_PASSWORD_CHAR_SUFFIX.toLowerCase()),
  );

  // if suffixes didn't match, take available WRITE as fallback
  // preferred idx for fallback and uuid of another char to check against
  const getFallback = (
    idx: 0 | 1,
    anotherUuidSuffix: string,
  ): Characteristic => {
    const anotherIdx = idx === 0 ? 1 : 0;

    return !chars[idx]?.uuid.endsWith(anotherUuidSuffix.toLowerCase())
      ? chars[idx]
      : chars[anotherIdx];
  };

  if (!ssidWriteChar) {
    ssidWriteChar = getFallback(0, WIFI_PASSWORD_CHAR_SUFFIX);
  }

  if (!passwordWriteChar) {
    passwordWriteChar = getFallback(1, WIFI_SSID_CHAR_SUFFIX);
  }

  return {
    ssidWriteChar,
    passwordWriteChar,
  };
}

function isWriteableChar(char: Characteristic): boolean {
  return char.isWritableWithResponse || char.isWritableWithoutResponse;
}

// returns required characteristics and service or null if not found
export async function findValidGattService(
  device: Device,
): Promise<GattData | null> {
  await device.discoverAllServicesAndCharacteristics();
  const services: Service[] = await device.services();

  for (const service of services) {
    const chars = await device.characteristicsForService(service.uuid);

    // filter characteristics by properties
    const readChars = chars.filter((c) => c.isReadable);
    const writeChars = chars.filter(isWriteableChar);
    const notifyChars = chars.filter((c) => c.isNotifiable);

    const { ssidWriteChar, passwordWriteChar } = findWriteChars(writeChars);
    const deviceIdReadChar: Characteristic | undefined = readChars[0];
    const notifyChar: Characteristic | undefined = notifyChars[0];

    if (ssidWriteChar && passwordWriteChar && deviceIdReadChar && notifyChar) {
      return {
        service,
        ssidWriteChar,
        passwordWriteChar,
        deviceIdReadChar,
        notifyChar,
      };
    }
  }

  return null;
}
