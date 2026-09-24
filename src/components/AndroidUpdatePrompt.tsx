import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import {
  checkAndroidUpdateOnce,
  downloadAndroidUpdate,
  formatDownloadSize,
  type AndroidUpdate,
} from '../data/androidUpdater';

export function AndroidUpdatePrompt() {
  const [update, setUpdate] = useState<AndroidUpdate | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void checkAndroidUpdateOnce().then(result => {
      if (active && result) setUpdate(result);
    });
    return () => { active = false; };
  }, []);

  if (!update) return null;

  const confirm = () => {
    try {
      downloadAndroidUpdate(update);
      setDownloading(true);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '无法开始下载');
    }
  };

  return <div className="android-update-backdrop" role="presentation">
    <section className="android-update-dialog" role="dialog" aria-modal="true" aria-label="发现新版本">
      {!downloading && <button className="android-update-close" type="button" onClick={() => setUpdate(null)} aria-label="取消更新"><X size={20} /></button>}
      <span className="android-update-eyebrow">APP UPDATE</span>
      <h2>{downloading ? '正在下载更新' : '发现新版本'}</h2>
      <p className="android-update-version">v{update.currentVersion} → <strong>v{update.latestVersion}</strong> · {formatDownloadSize(update.downloadSize)}</p>
      {downloading
        ? <p className="android-update-message">APK将在后台下载。下载完成后会自动打开Android安装页面；首次更新可能需要先允许本应用安装未知应用。</p>
        : <div className="android-update-notes">{update.releaseNotes}</div>}
      {error && <p className="android-update-error">{error}</p>}
      <footer>
        {downloading
          ? <button type="button" className="primary-action" onClick={() => setUpdate(null)}>知道了</button>
          : <><button type="button" className="ghost-button" onClick={() => setUpdate(null)}>取消</button>
            <button type="button" className="primary-action" onClick={confirm}><Download size={18} />下载并更新</button></>}
      </footer>
    </section>
  </div>;
}
