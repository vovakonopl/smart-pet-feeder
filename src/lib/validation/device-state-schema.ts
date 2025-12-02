import { z } from 'zod';

import { EFeedingState } from '@/src/lib/types/schedule-item';

export const deviceStateSchema = z.object({
  lastFedTime: z.string().transform((timeIso: string) => {
    const date = new Date(timeIso);
    return Number.isNaN(date.getTime()) ? null : date;
  }),

  schedule: z.array(
    z.object({
      feedTimeMinutes: z
        .number()
        .min(0)
        .max(24 * 60),

      state: z.nativeEnum(EFeedingState),
    }),
  ),
});

export type TDeviceState = z.infer<typeof deviceStateSchema>;
