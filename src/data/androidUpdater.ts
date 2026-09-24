const RELEASES_URL = 'https://api.github.com/repos/dandancow874/epic7-calc-mobile/releases/latest';
const APK_PATTERN = /^Epic7-Calc-Mobile-v(\d+\.\d+\.\d+)-arm64\.apk$/;

export type AndroidUpdate = {
  currentVersion: string;
  latestVersion: string;
  downloadUrl: string;
  downloadSize: number;
  fileName: string;
  releaseName: string;
  releaseNotes: string;
};

type GitHubRelease = {
  tag_name?: string;
  name?: string;
  body?: string;
  assets?: Array<{ name?: string; browser_download_url?: string; size?: number }>;
};

declare global {
  interface Window {
    Epic7Updater?: {
      downloadAndInstall(url: string, fileName: string): void;
    };
  }
}

export const CURRENT_ANDROID_VERSION = normalizeVersion(__APP_VERSION__);

let startupCheckStarted = false;

/** The app calls this once per process start. Failures stay silent by design. */
export async function checkAndroidUpdateOnce(): Promise<AndroidUpdate | null> {
  if (startupCheckStarted || !window.Epic7Updater) return null;
  startupCheckStarted = true;
  const release = await fetchLatestRelease();
  if (!release?.tag_name) return null;
  const latestVersion = normalizeVersion(release.tag_name);
  if (compareVersions(latestVersion, CURRENT_ANDROID_VERSION) <= 0) return null;
  const asset = release.assets?.find(item => !!item.name && APK_PATTERN.test(item.name));
  if (!asset?.name || !asset.browser_download_url) return null;
  return {
    currentVersion: CURRENT_ANDROID_VERSION,
    latestVersion,
    downloadUrl: asset.browser_download_url,
    downloadSize: Math.max(0, asset.size || 0),
    fileName: asset.name,
    releaseName: release.name?.trim() || `v${latestVersion}`,
    releaseNotes: release.body?.trim() || '该版本未填写更新说明。',
  };
}

export function downloadAndroidUpdate(update: AndroidUpdate) {
  if (!window.Epic7Updater) throw new Error('当前环境不支持APK安装');
  window.Epic7Updater.downloadAndInstall(update.downloadUrl, update.fileName);
}

export function formatDownloadSize(bytes: number) {
  return bytes > 0 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : '大小未知';
}

export function normalizeVersion(value: string) {
  return value.trim().replace(/^v/i, '') || '0.0.0';
}

export function compareVersions(left: string, right: string) {
  const leftParts = normalizeVersion(left).split('.').map(item => Number(item) || 0);
  const rightParts = normalizeVersion(right).split('.').map(item => Number(item) || 0);
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] || 0) - (rightParts[index] || 0);
    if (difference) return difference;
  }
  return 0;
}

async function fetchLatestRelease(): Promise<GitHubRelease | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(RELEASES_URL, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function resetAndroidUpdateCheckForTests() {
  startupCheckStarted = false;
}
