declare module 'mammoth/mammoth.browser' {
  interface ExtractRawTextOptions {
    arrayBuffer: ArrayBuffer;
  }

  interface ExtractRawTextResult {
    value: string;
    messages: unknown[];
  }

  interface ExtractHtmlOptions {
    arrayBuffer: ArrayBuffer;
  }

  interface ExtractHtmlResult {
    value: string;
    messages: unknown[];
  }

  export function extractRawText(options: ExtractRawTextOptions): Promise<ExtractRawTextResult>;
  export function extractHtml(options: ExtractHtmlOptions): Promise<ExtractHtmlResult>;
}
