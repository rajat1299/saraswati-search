declare module 'exa-js' {
  export class ExaAPI {
    constructor(apiKey: string);
    searchAndContents(query: string, options: SearchOptions): Promise<SearchResult>;
  }

  interface SearchOptions {
    type: string;
    useAutoprompt: boolean;
    numResults: number;
    text: boolean;
  }

  interface SearchResult {
    results: ExaResult[];
  }

  interface ExaResult {
    title: string;
    url: string;
    text: string;
    score?: number;
  }
}