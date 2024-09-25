export interface KagiSummarizerWordStats {
  n_tokens: number;
  n_words: number;
  n_pages: number;
  time_saved: number;
  length: null;
}

export interface KagiSummarizerResponseMetadata {
  speed: number;
  tokens: number;
  total_time_second: number;
  model: string;
}

export interface KagiSummarizerOutputData {
  status: string;
  word_stats: KagiSummarizerWordStats;
  elapsed_seconds: number;
  markdown: string;
  citations_json: unknown[];
  citation_snippets: string;
  references: unknown[];
  md_references: string;
  references_text: string;
  response_metadata: KagiSummarizerResponseMetadata;
  images: unknown[];
}

export interface KagiSummarizerOutputResponse {
  output_text: string;
  output_data: KagiSummarizerOutputData;
  tokens: number;
  type: string;
}
