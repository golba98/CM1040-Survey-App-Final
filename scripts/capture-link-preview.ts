import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";

/**
 * Renders scripts/link-preview.html to public/link-preview.png, the Open Graph
 * card chat apps show when the survey link is pasted. 1200x630 is the ratio
 * Discord, Slack, WhatsApp, iMessage and X all expect; anything else gets
 * letterboxed or cropped by one of them.
 */
const source = fileURLToPath(new URL("./link-preview.html", import.meta.url));
const target = fileURLToPath(
  new URL("../public/link-preview.png", import.meta.url),
);

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.goto(`file://${source}`, { waitUntil: "networkidle" });
  // The three design thumbnails are large PNGs; give the decode a moment so the
  // card is never captured with empty frames.
  await page.evaluate(() =>
    Promise.all(
      [...document.images].map((image) =>
        image.complete ? null : image.decode().catch(() => null),
      ),
    ),
  );
  await page.screenshot({ path: target });
  await browser.close();
  console.log(`wrote ${target}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
