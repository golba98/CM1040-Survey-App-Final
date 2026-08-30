import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

const sourceRoot = "/home/k9-vortex/Development/1-JavaScript(Type)/33-Prototype Implementation";
const targetRoot = new URL("../public/prototypes/", import.meta.url).pathname;
const projects = [
  { folder: "1-Timeline-History-Demo", key: "timeline" },
  { folder: "2-Editorial-Story-Demo", key: "editorial" },
  { folder: "3-Visual-Data-Demo", key: "visual-data" },
];
const routes = [
  { file: "index.html", key: "bandwidth" },
  { file: "mobile-local.html", key: "local" },
  { file: "digital-divide.html", key: "divide" },
];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  let port = 5180;
  for (const project of projects) {
    const projectPort = port++;
    const server = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(projectPort)], { cwd: `${sourceRoot}/${project.folder}`, stdio: "ignore" });
    await sleep(1200);
    for (const route of routes) {
      for (const viewport of [{ name: "desktop", width: 1440, height: 1000 }, { name: "mobile", width: 390, height: 900 }]) {
        const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: viewport.name === "mobile" ? 2 : 1 });
        await page.goto(`http://127.0.0.1:${projectPort}/${route.file}`, { waitUntil: "networkidle" });
        await page.screenshot({ path: `${targetRoot}${project.key}/${route.key}/${viewport.name}.png`, fullPage: true, scale: viewport.name === "mobile" ? "device" : "css" });
        await page.close();
      }
    }
    server.kill();
  }
  await browser.close();
}

await Promise.all(projects.flatMap((p) => routes.map((r) => mkdir(`${targetRoot}${p.key}/${r.key}`, { recursive: true }))));
await main();
