import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkAndroidUpdateOnce, compareVersions, normalizeVersion, resetAndroidUpdateCheckForTests } from './androidUpdater';

afterEach(() => {
  vi.unstubAllGlobals();
  resetAndroidUpdateCheckForTests();
});

describe('Android GitHub updater', () => {
  it('compares semantic versions and strips the v prefix', () => {
    expect(normalizeVersion('v0.1.9')).toBe('0.1.9');
    expect(compareVersions('0.1.10', '0.1.9')).toBeGreaterThan(0);
    expect(compareVersions('0.1.8', '0.1.8')).toBe(0);
  });

  it('checks only once and selects the signed arm64 APK', async () => {
    vi.stubGlobal('window', {
      Epic7Updater: { downloadAndInstall: vi.fn() },
      setTimeout,
      clearTimeout,
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tag_name: 'v9.0.0', name: '新版', body: '更新说明',
        assets: [
          { name: 'Epic7-Calc-Mobile-v9.0.0-arm64.apk.sha256', browser_download_url: 'https://example.invalid/hash' },
          { name: 'Epic7-Calc-Mobile-v9.0.0-arm64.apk', browser_download_url: 'https://github.com/dandancow874/epic7-calc-mobile/releases/download/v9.0.0/app.apk', size: 123 },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await expect(checkAndroidUpdateOnce()).resolves.toMatchObject({ latestVersion: '9.0.0', downloadSize: 123 });
    await expect(checkAndroidUpdateOnce()).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
