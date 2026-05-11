import puppeteer from 'puppeteer';

export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Give any dynamic content a moment to finish rendering
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return Buffer.from(pdf);
  } catch (err) {
    console.error('PDF export error:', err);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) await browser.close();
  }
}
