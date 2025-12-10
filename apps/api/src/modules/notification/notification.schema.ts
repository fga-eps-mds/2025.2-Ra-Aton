import { z } from 'zod';

export const SavePushTokenSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
});

export type SavePushTokenInput = z.infer<typeof SavePushTokenSchema>['body'];
