declare module 'exa-js' {
  export default class Exa {
    constructor(apiKey: string);
    searchAndContents(query: string, options: SearchOptions): Promise<SearchResult>;
  }

  export interface SearchOptions {
    type: string;
    useAutoprompt: boolean;
    numResults: number;
    text: boolean;
  }

  export interface SearchResult {
    results: ExaResult[];
  }

  export interface ExaResult {
    title: string;
    url: string;
    text: string;
    score?: number;
  }
}