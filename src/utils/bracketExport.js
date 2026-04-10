import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { createTheme, ThemeProvider } from '@mui/material';
import { getDesignTokens } from '../theme/theme';
import DesktopBracketGrid from '../components/bracket/DesktopBracketGrid';
import BracketExportBanner from '../components/bracket/BracketExportBanner';
import { toPng } from 'html-to-image';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// 1x1 transparent PNG - used to blank out images that failed to load so
// html-to-image never tries to fetch a 404/error URL during toPng().
const TRANSPARENT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

/**
 * Convert an already-loaded image element into a data URL without re-fetching
 * it from the network. This keeps export working offline after the bracket has
 * already rendered and still bypasses html-to-image's internal fetch path.
 */
function inlineLoadedImage(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
  return canvas.toDataURL('image/png');
}

/**
 * Wait for all <img> elements inside a container to settle (load or error),
 * then pre-inline loaded images as data URLs.
 *
 * Why pre-inline?
 * html-to-image fetches image srcs internally via fetch(). When a resource is
 * already browser-cached, fetch() may return a bodyless 304 Not Modified,
 * producing an empty data URL that breaks canvas rendering. Pre-inlining from
 * the already-decoded bitmap bypasses html-to-image's fetch path entirely.
 *
 * Failed images (404, missing file) are replaced with a transparent 1x1 PNG so
 * html-to-image has nothing to fetch - avoids the canvas error that
 * previously caused locked-mode exports to fail.
 */
export async function prepareImagesForExport(container, timeout = 5000) {
  const imgs = Array.from(container.querySelectorAll('img'));
  if (imgs.length === 0) return;

  // Step 1: wait for all images to settle - use addEventListener so we don't
  // overwrite React's onError handlers (which set imgError state in BonusPicks).
  const settled = imgs.map(
    (img) =>
      new Promise((resolve) => {
        if (img.complete) return resolve(img);
        img.addEventListener('load', () => resolve(img), { once: true });
        img.addEventListener('error', () => resolve(img), { once: true });
      }),
  );
  await Promise.race([
    Promise.all(settled),
    new Promise((resolve) => setTimeout(resolve, timeout)),
  ]);

  // Step 2: inline loaded images from the decoded bitmap; blank out anything
  // that never loaded so html-to-image won't try to fetch it later.
  await Promise.all(
    imgs.map(async (img) => {
      if (!img.src || img.src.startsWith('data:')) return;

      if (!img.complete || img.naturalWidth === 0) {
        // Image didn't load (404, missing file, etc.) - blank it out so
        // html-to-image doesn't attempt a fetch that would also fail.
        img.src = TRANSPARENT_PNG;
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        return;
      }

      try {
        const dataUrl = inlineLoadedImage(img);
        if (dataUrl) {
          img.src = dataUrl;
          img.removeAttribute('srcset');
          img.removeAttribute('sizes');
        }
      } catch {
        // If serialization fails, keep the already-rendered image source rather
        // than replacing it. html-to-image still gets cacheBust below as backup.
      }
    }),
  );
}

/** Convert a base64 data URL to a Blob. */
function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/** Sanitize a string for use as a filename. */
function sanitizeFileName(name) {
  return name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '') // Allow any Unicode letter/number + hyphens
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'bracket'; // Fallback if everything was stripped
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render the bracket off-screen and capture it as a PNG Blob.
 *
 * Renders DesktopBracketGrid (always the full grid layout, even on mobile)
 * inside a hidden container, waits for images, then captures via
 * html-to-image's toPng at 2x resolution.
 *
 * Key technique: the container is hidden with opacity:0 so it doesn't flash
 * on screen. html-to-image clones the DOM and inlines getComputedStyle() on
 * each element - MUI/Emotion styles from document.head are picked up. The
 * toPng `style` option overrides opacity on the clone so it renders visibly.
 */
export async function captureBracketImage({
  bracket,
  bonusPicks,
  scoringConfig,
  isLocked,
  playerName,
  leagueName,
  themeMode,
}) {
  const theme = createTheme(getDesignTokens(themeMode));
  const bgColor = theme.palette.background.default;

  // Container: hidden with opacity:0 so the user doesn't see a flash.
  // position:fixed + in-viewport ensures browser fully computes layout/styles.
  const container = document.createElement('div');
  container.id = 'bracket-export-root';
  Object.assign(container.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '1600px',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '-9999',
    backgroundColor: bgColor,
  });
  document.body.appendChild(container);

  // Export-specific overrides:
  // 1. Prevent mobile text inflation on wide content
  // 2. Kill animations so cards don't start at opacity:0
  // 3. Prevent chip label truncation - mobile viewport constraints can
  //    shrink chips slightly, causing ellipsis on labels like "Pending"
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    #bracket-export-root {
      -webkit-text-size-adjust: 100% !important;
      text-size-adjust: 100% !important;
    }
    #bracket-export-root *,
    #bracket-export-root *::before,
    #bracket-export-root *::after {
      animation: none !important;
      transition: none !important;
    }
    #bracket-export-root .MuiChip-label {
      text-overflow: clip !important;
      overflow: visible !important;
    }
    #bracket-export-root .MuiChip-root {
      max-width: none !important;
    }
  `;
  document.head.appendChild(styleTag);

  let root;
  try {
    root = createRoot(container);
    flushSync(() => {
      root.render(
        <ThemeProvider theme={theme}>
          <BracketExportBanner playerName={playerName} leagueName={leagueName} />
          <div style={{ padding: '12px 8px 16px' }}>
            <DesktopBracketGrid
              bracket={bracket}
              isLocked={isLocked}
              onMatchupClick={undefined}
              bonusPicks={bonusPicks}
              scoringConfig={scoringConfig}
            />
          </div>
        </ThemeProvider>,
      );
    });

    await prepareImagesForExport(container);

    // Let the browser paint one frame so getComputedStyle() returns final values
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const dataUrl = await toPng(container, {
      pixelRatio: 2,
      backgroundColor: bgColor,
      // Images were pre-inlined as data URLs by prepareImagesForExport() above,
      // so html-to-image has nothing to fetch. cacheBust is kept as a safety net
      // in case any image src wasn't processed (e.g. added after render).
      cacheBust: true,
      // Override hiding styles on the CLONE so it renders visibly in the SVG.
      // html-to-image applies these to the cloned root element, not the original.
      style: {
        opacity: '1',
        position: 'static',
        left: 'auto',
        top: 'auto',
        zIndex: 'auto',
        pointerEvents: 'auto',
      },
    });

    return dataUrlToBlob(dataUrl);
  } finally {
    if (root) root.unmount();
    container.remove();
    styleTag.remove();
  }
}

/** Trigger a PNG download via a temporary anchor element. */
export function downloadBracketImage(blob, playerName) {
  const safeName = sanitizeFileName(playerName || 'bracket');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}-bracket.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Share via the Web Share API (mobile native share sheet).
 * Falls back to download if Web Share is unavailable or fails.
 */
export async function shareBracketImage(blob, playerName) {
  const safeName = sanitizeFileName(playerName || 'bracket');
  const file = new File([blob], `${safeName}-bracket.png`, { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'My Playoff Prophet Bracket',
      });
      return true;
    } catch (err) {
      // User cancelled or share failed - only fall back on real errors
      if (err.name === 'AbortError') return false;
    }
  }

  // Fallback: download
  downloadBracketImage(blob, playerName);
  return true;
}

/**
 * Copy the bracket PNG to the clipboard.
 * Falls back to download if the Clipboard API is unavailable.
 */
export async function copyBracketImage(blob) {
  if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      return true;
    } catch {
      // Clipboard write failed - fall back
    }
  }
  return false;
}
