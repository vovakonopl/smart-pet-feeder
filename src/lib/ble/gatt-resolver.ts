import type { Device, Characteristic, Service } from 'react-native-ble-plx';

export type GattServiceData = {
  service: Service;
  wifiWriteChar: Characteristic;
  deviceIdReadChar: Characteristic;
  notifyChar: Characteristic;
};

function isWriteableChar(char: Characteristic): boolean {
  return char.isWritableWithResponse || char.isWritableWithoutResponse;
}

// returns required characteristics and service or null if not found
export async function findValidGattService(
  device: Device,
): Promise<GattServiceData | null> {
  await device.discoverAllServicesAndCharacteristics();
  const services: Service[] = await device.services();

  for (const service of services) {
    const chars = await device.characteristicsForService(service.uuid);

    // filter characteristics by properties
    const readChars = chars.filter((c) => c.isReadable);
    const writeChars = chars.filter(isWriteableChar);
    const notifyChars = chars.filter((c) => c.isNotifiable);

    const wifiWriteChar: Characteristic | undefined = writeChars[0];
    const deviceIdReadChar: Characteristic | undefined = readChars[0];
    const notifyChar: Characteristic | undefined = notifyChars[0];

    if (wifiWriteChar && deviceIdReadChar && notifyChar) {
      return {
        service,
        wifiWriteChar,
        deviceIdReadChar,
        notifyChar,
      };
    }
  }

  return null;
}
