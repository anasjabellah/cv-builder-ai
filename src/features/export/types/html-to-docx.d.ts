declare module 'html-to-docx' {
  export default function HtmlToDocx(
    html: string,
    options?: any,
    config?: any
  ): Promise<Buffer | Uint8Array>;
}
