/**
 * Automated draw.io library validation via Playwright.
 *
 * Opens app.diagrams.net, imports StageEquipment.xml via the
 * File > Open Library menu, and checks whether shapes render.
 *
 * Usage:  node test-library.mjs [--headed]
 */

import { chromium } from "playwright";
import { readFileSync } from "fs";
import path from "path";

const HEADED = process.argv.includes("--headed");
const LIB_PATH = path.resolve(process.argv[2] || "StageEquipment.xml");

async function run() {
  console.log(`Library: ${LIB_PATH}`);
  console.log(`Headed: ${HEADED}\n`);

  const browser = await chromium.launch({ headless: !HEADED });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  // Capture console logs
  page.on("console", (msg) => {
    if (msg.type() === "error") {
        console.log(`BROWSER ERROR: ${msg.text()}`);
    }
  });

  page.on("pageerror", (err) => {
    console.log(`BROWSER PAGE ERROR: ${err.message}`);
  });

  // ── 1. Open draw.io ──
  console.log("Opening draw.io…");
  await page.goto(
    "https://app.diagrams.net/?splash=0&noSaveBtn=1&noExitBtn=1",
    { waitUntil: "networkidle", timeout: 60_000 }
  );

  // Dismiss storage dialog if present (pick "Device")
  try {
    const deviceBtn = page.locator('button:has-text("Device")');
    await deviceBtn.waitFor({ timeout: 8_000 });
    await deviceBtn.click();
    console.log("Dismissed storage dialog.");
  } catch {
    console.log("No storage dialog.");
  }

  // Wait for editor
  await page.waitForSelector(".geDiagramContainer", { timeout: 30_000 });
  await page.waitForTimeout(2_000);
  console.log("Editor ready.\n");

  // ── 2. File > Open Library from > Device ──
  console.log("Opening library via File menu…");

  // Click File menu
  await page.locator('a.geItem:has-text("File")').first().click();
  await page.waitForTimeout(500);

  // Hover "Open Library from" submenu
  const openLibItem = page.locator('tr.mxPopupMenuItem:has-text("Open Library from")');
  await openLibItem.hover();
  await page.waitForTimeout(500);

  // Set up file chooser listener BEFORE clicking
  const fileChooserPromise = page.waitForEvent("filechooser", { timeout: 15_000 });

  // Click "Device" in the submenu
  const deviceOption = page.locator('td.mxPopupMenuItem:has-text("Device")').last();
  await deviceOption.click();

  console.log("Waiting for file dialog…");
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(LIB_PATH);
  console.log("Library file uploaded.\n");

  // Wait for the library panel to appear in the sidebar
  console.log("Waiting for library to load…");
  await page.waitForTimeout(8_000);

  // Try to expand the library if it's collapsed
  try {
    const stageTitle = page.locator('.geTitle:has-text("StageEquipment")');
    if (await stageTitle.count() > 0) {
        console.log("Expanding StageEquipment palette…");
        await stageTitle.click();
        await page.waitForTimeout(2_000);
    }
  } catch (e) {
    console.log("Failed to click StageEquipment title:", e.message);
  }

  // ── 3. Screenshot ──
  const screenshotPath = path.resolve("library-test-result.png");
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot: ${screenshotPath}`);

  // ── 4. Validate shapes ──
  const result = await page.evaluate(() => {
    // Find all elements with text that might be our library
    const allElements = Array.from(document.querySelectorAll("*"));
    const stageElements = allElements.filter(el => 
      el.textContent.toLowerCase().includes("stage") || 
      el.textContent.toLowerCase().includes("equipment")
    );

    const stageTexts = stageElements.map(el => ({
      tagName: el.tagName,
      className: el.className,
      text: el.textContent.trim().substring(0, 50)
    }));

    // Find all thumbnail-like elements
    const allItems = Array.from(document.querySelectorAll(".geItem, [title]"));
    const allTitles = allItems.map(i => i.getAttribute("title")).filter(t => t);

    // Deep inspect StageEquipment palette
    const stageTitleEl = Array.from(document.querySelectorAll(".geTitle"))
      .find(t => t.textContent.includes("StageEquipment"));

    let paletteContent = [];
    if (stageTitleEl) {
        // The palette is often the next sibling or an sibling of the title
        let p = stageTitleEl.nextElementSibling;
        while (p && !p.classList.contains("gePalette")) {
            p = p.nextElementSibling;
        }
        if (p) {
            paletteContent = Array.from(p.querySelectorAll("*")).map(el => ({
                tagName: el.tagName,
                className: el.className,
                title: el.getAttribute("title"),
                width: el.offsetWidth,
                height: el.offsetHeight
            }));
        }
    }


    // Find all thumbnail images in the whole document as backup
    const imgs = Array.from(document.querySelectorAll("img"));
    const thumbs = imgs.filter((img) => {
      const src = img.getAttribute("src") || "";
      return src.startsWith("data:") || src.includes("svg") || img.width > 20;
    });

    const broken = thumbs.filter(
      (img) => img.naturalWidth === 0 && img.complete
    );

    // Find all elements containing Microphone or other shape names
    const sidebarText = Array.from(document.querySelectorAll(".geSidebarContainer *"))
      .filter(el => el.children.length === 0 && el.textContent.trim().length > 0)
      .map(el => el.textContent.trim());

    const hasMic = sidebarText.some(t => t.includes("Microphone"));
    const hasDrum = sidebarText.some(t => t.includes("Drum Kit"));

    return {
      allTextSample: sidebarText.slice(0, 50),
      totalThumbs: thumbs.length,
      hasMicrophone: hasMic,
      hasDrumKit: hasDrum,
      brokenThumbs: broken.length,
      libraryFound: stageTexts.length > 0
    };
  });

  console.log("\nResults:");
  console.log(JSON.stringify(result, null, 2));

  if (!result.libraryFound) {
    console.log("\n✗ FAIL: StageEquipment library not found in sidebar");
  } else if (result.stageThumbs === 0) {
    console.log("\n✗ FAIL: Library found but no items rendered");
  } else if (result.brokenThumbs > 0) {
    console.log(
      `\n✗ FAIL: ${result.brokenThumbs}/${result.totalThumbs} broken thumbnails`
    );
  } else {
    console.log(
      `\n✓ PASS: Library loaded, ${result.stageThumbs} StageEquipment thumbnails rendered`
    );
  }

  if (HEADED) {
    console.log("\nBrowser open for inspection. Ctrl+C to exit.");
    await new Promise(() => {});
  }

  await browser.close();
}

run().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
