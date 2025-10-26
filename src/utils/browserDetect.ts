export interface BrowserInfo {
  isInAppBrowser: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  browserName: string;
  supportsWebGL: boolean;
  supportsWASM: boolean;
}

export function detectBrowser(): BrowserInfo {
  const ua = navigator.userAgent;

  // Detect platform
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isMobile = isIOS || isAndroid || /Mobile/.test(ua);

  // Detect in-app browsers
  const isInAppBrowser =
    /FBAN|FBAV|Instagram|Line|Twitter|FB_IAB|FB4A|FBIOS/.test(ua) || // Social apps
    /micromessenger|weibo|qq/i.test(ua) || // Chinese apps
    /wv/.test(ua); // WebView

  // Detect browser
  let browserName = "Unknown";
  if (isInAppBrowser) {
    if (/FBAN|FBAV|FB_IAB/.test(ua)) browserName = "Facebook";
    else if (/Instagram/.test(ua)) browserName = "Instagram";
    else if (/Line/i.test(ua)) browserName = "LINE";
    else if (/Twitter/.test(ua)) browserName = "Twitter";
    else if (/micromessenger/i.test(ua)) browserName = "WeChat";
    else browserName = "In-App Browser";
  } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    browserName = "Safari";
  } else if (/Chrome/.test(ua)) {
    browserName = "Chrome";
  } else if (/Firefox/.test(ua)) {
    browserName = "Firefox";
  }

  // Check WebGL support
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  const supportsWebGL = !!gl;

  // Check WASM support
  const supportsWASM = typeof WebAssembly === "object";

  return {
    isInAppBrowser,
    isIOS,
    isAndroid,
    isMobile,
    browserName,
    supportsWebGL,
    supportsWASM,
  };
}

export function showBrowserWarning(browserInfo: BrowserInfo): boolean {
  if (!browserInfo.supportsWebGL) {
    alert(
      "⚠️ Your browser doesn't support WebGL.\n\nPlease use a modern browser like Chrome or Safari."
    );
    return true;
  }

  if (!browserInfo.supportsWASM) {
    alert(
      "⚠️ Your browser doesn't support WebAssembly.\n\nPlease update your browser or use Chrome/Safari."
    );
    return true;
  }

  if (browserInfo.isInAppBrowser) {
    // Show warning UI
    const warningDiv = document.getElementById("browser-warning");
    if (warningDiv) {
      warningDiv.classList.remove("hidden");
    }

    // Setup copy URL button
    const openBtn = document.getElementById("open-in-browser-btn");
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        // Copy URL to clipboard
        const url = window.location.href;

        // Try to copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(url)
            .then(() => {
              alert(
                "✅ URL copied!\n\nNow:\n1. Open Safari/Chrome\n2. Paste the URL\n3. Enjoy the game!"
              );
            })
            .catch(() => {
              // Fallback: show URL
              prompt("Copy this URL and open in Safari/Chrome:", url);
            });
        } else {
          // Fallback for older browsers
          prompt("Copy this URL and open in Safari/Chrome:", url);
        }
      });
    }

    return true;
  }

  return false;
}

export function logBrowserInfo(browserInfo: BrowserInfo): void {
  console.log("📱 Browser Detection:");
  console.log(
    `  Platform: ${
      browserInfo.isIOS ? "iOS" : browserInfo.isAndroid ? "Android" : "Desktop"
    }`
  );
  console.log(`  Browser: ${browserInfo.browserName}`);
  console.log(`  In-App: ${browserInfo.isInAppBrowser ? "Yes ⚠️" : "No"}`);
  console.log(`  WebGL: ${browserInfo.supportsWebGL ? "✅" : "❌"}`);
  console.log(`  WASM: ${browserInfo.supportsWASM ? "✅" : "❌"}`);
}
