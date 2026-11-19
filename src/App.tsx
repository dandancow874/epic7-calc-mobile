import { useEffect, useState } from 'react';
import { CalculatorWorkspace } from './CalculatorWorkspace';
import { loadAppPage, saveAppPage, type AppPage } from './app/navigation';
import { PrimaryNav, type CalculatorMode } from './components/app-shell/PrimaryNav';
import { HeroBuildPage } from './pages/builds/HeroBuildPage';
import { hydrateProfilesFromDisk, loadProfile, saveProfile } from './data/profiles';
import { rememberCalculatorBuild } from './features/build-presets/calculatorBuildBridge';
import { handleMobileBack } from './mobileBack';
import { AndroidUpdatePrompt } from './components/AndroidUpdatePrompt';

export function App() {
  const [page, setPage] = useState<AppPage>(loadAppPage);
  const [buildHeroCode, setBuildHeroCode] = useState<string | null>(() => localStorage.getItem('epic7.tools.buildHero.v1'));
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>('damage');

  useEffect(() => saveAppPage(page), [page]);
  useEffect(() => {
    window.__epic7HandleBack = handleMobileBack;
    return () => { delete window.__epic7HandleBack; };
  }, []);

  return (
    <>
      <AndroidUpdatePrompt />
      <div className="suite-nav-shell"><PrimaryNav page={page} calculatorMode={calculatorMode} onNavigate={setPage} onCalculatorMode={setCalculatorMode} /></div>
      {page === 'calculator' && <CalculatorWorkspace requestedMode={calculatorMode} onModeChange={setCalculatorMode} />}
      {page === 'builds' && <HeroBuildPage initialHeroCode={buildHeroCode} onUseInCalculator={async (side, heroId, presetId) => {
        await hydrateProfilesFromDisk();
        await saveProfile(side, heroId, { ...loadProfile(side, heroId), useBuildPreset: true });
        localStorage.setItem(`epic7.tools.calculatorHero.${side}.v1`, heroId);
        rememberCalculatorBuild(side, heroId, presetId);
        setPage('calculator');
      }} />}
    </>
  );
}
