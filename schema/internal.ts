import { z } from "zod";

const FullUrlResponseSchema = z.object({ url: z.string() });

type FullUrlResponse = z.infer<typeof FullUrlResponseSchema>;

export { FullUrlResponseSchema };

export type { FullUrlResponse };
