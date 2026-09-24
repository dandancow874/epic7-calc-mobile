import { useEffect, useState } from 'react';
import { CalculatorWorkspace } from './CalculatorWorkspace';
import { loadAppPage, saveAppPage, type AppPage } from './app/navigation';
import { PrimaryNav, type CalculatorMode } from './components/app-shell/PrimaryNav';
import { HeroBuildPage } from './pages/builds/HeroBuildPage';
import { rememberCalculatorBuild } from './features/build-presets/calculatorBuildBridge';
import { handleMobileBack } from './mobileBack';

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
      <div className="suite-nav-shell"><PrimaryNav page={page} calculatorMode={calculatorMode} onNavigate={setPage} onCalculatorMode={setCalculatorMode} /></div>
      {page === 'calculator' && <CalculatorWorkspace requestedMode={calculatorMode} onModeChange={setCalculatorMode} />}
      {page === 'builds' && <HeroBuildPage initialHeroCode={buildHeroCode} onUseInCalculator={(side, heroId, presetId) => {
        localStorage.setItem(`epic7.tools.calculatorHero.${side}.v1`, heroId);
        rememberCalculatorBuild(side, heroId, presetId);
        setPage('calculator');
      }} />}
    </>
  );
}
