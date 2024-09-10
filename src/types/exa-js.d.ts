declare module 'exa-js' {
  export default class Exa {
    constructor(apiKey: string);
    searchAndContents(query: string, options: any): Promise<any>;
  }
}