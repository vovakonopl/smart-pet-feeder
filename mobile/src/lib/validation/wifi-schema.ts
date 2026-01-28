import { z } from 'zod';

import { WIFI_FIELDS_LENGTHS } from '@/src/lib/constants/fields/wifi-fields-lengths';

export const wifiSchema = z.object({
  ssid: z
    .string({ message: 'Must be a string.' })
    .min(WIFI_FIELDS_LENGTHS.ssid.min, {
      message: `Min length is ${WIFI_FIELDS_LENGTHS.ssid.min} characters.`,
    })
    .max(WIFI_FIELDS_LENGTHS.ssid.max, {
      message: `Max length is ${WIFI_FIELDS_LENGTHS.ssid.max} characters.`,
    }),

  password: z
    .string({ message: 'Must be a string.' })
    .min(WIFI_FIELDS_LENGTHS.password.min, {
      message: `Min length is ${WIFI_FIELDS_LENGTHS.password.min} characters.`,
    })
    .max(WIFI_FIELDS_LENGTHS.password.max, {
      message: `Max length is ${WIFI_FIELDS_LENGTHS.password.max} characters.`,
    }),
});

export type TWifiData = z.infer<typeof wifiSchema>;
