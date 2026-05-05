const HtmlToDocx = require('html-to-docx');

export async function generateWordFromHTML(html: string): Promise<Buffer> {
  const buffer = await HtmlToDocx(html, null, {
    table: { row: { cantSplit: true } },
    footer: false,
    header: false,
  });
  return Buffer.from(buffer);
}
