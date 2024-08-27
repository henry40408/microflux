import { z } from "zod";

const KagiSummarizerWordStatsSchema = z.object({
  n_tokens: z.number(),
  n_words: z.number(),
  n_pages: z.number(),
  time_saved: z.number(),
  length: z.null(),
});

const KagiSummarizerResponseMetadataSchema = z.object({
  speed: z.number(),
  tokens: z.number(),
  total_time_second: z.number(),
  model: z.string(),
});

const KagiSummarizerOutputDataSchema = z.object({
  status: z.string(),
  word_stats: KagiSummarizerWordStatsSchema,
  elapsed_seconds: z.number(),
  markdown: z.string(),
  citations_json: z.array(z.unknown()),
  citation_snippets: z.string(),
  references: z.array(z.unknown()),
  md_references: z.string(),
  references_text: z.string(),
  response_metadata: KagiSummarizerResponseMetadataSchema,
  images: z.array(z.unknown()),
});

const KagiSummarizerOutputResponseSchema = z.object({
  output_text: z.string(),
  output_data: KagiSummarizerOutputDataSchema,
  tokens: z.number(),
  type: z.string(),
});

type KagiSummarizerWordStats = z.infer<typeof KagiSummarizerWordStatsSchema>;
type KagiSummarizerResponseMetadata = z.infer<
  typeof KagiSummarizerResponseMetadataSchema
>;
type KagiSummarizerOutputData = z.infer<typeof KagiSummarizerOutputDataSchema>;
type KagiSummarizerOutputResponse = z.infer<
  typeof KagiSummarizerOutputResponseSchema
>;

export {
  KagiSummarizerWordStatsSchema,
  KagiSummarizerResponseMetadataSchema,
  KagiSummarizerOutputDataSchema,
  KagiSummarizerOutputResponseSchema,
};

export type {
  KagiSummarizerWordStats,
  KagiSummarizerResponseMetadata,
  KagiSummarizerOutputData,
  KagiSummarizerOutputResponse,
};
