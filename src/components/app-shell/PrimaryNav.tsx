import { Calculator, ChevronRight, FlaskConical, Gauge, Menu, Shield, Swords, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AppPage } from '../../app/navigation';

export type CalculatorMode = 'damage' | 'speed' | 'cr';

type Props = {
  page: AppPage;
  calculatorMode: CalculatorMode;
  onNavigate: (page: AppPage) => void;
  onCalculatorMode: (mode: CalculatorMode) => void;
};

const items: Array<{ page: AppPage; mode?: CalculatorMode; label: string; caption: string; icon: typeof Calculator }> = [
  { page: 'calculator', mode: 'damage', label: '伤害计算', caption: '技能伤害与战斗状态', icon: Swords },
  { page: 'calculator', mode: 'speed', label: '速度推算', caption: '首轮速度区间', icon: Gauge },
  { page: 'calculator', mode: 'cr', label: '速攻值推算', caption: '行动条变化', icon: Calculator },
  { page: 'builds', label: '角色装备', caption: '面板、套装与神器预设', icon: Shield },
];

export function PrimaryNav({ page, calculatorMode, onNavigate, onCalculatorMode }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('keydown', close);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const current = items.find((item) => item.page === page && (item.page === 'builds' || item.mode === calculatorMode)) || items[0];
  const select = (item: (typeof items)[number]) => {
    if (item.mode) onCalculatorMode(item.mode);
    onNavigate(item.page);
    setOpen(false);
  };

  return (
    <>
      <header className="mobile-appbar">
        <button type="button" className="mobile-appbar__menu" onClick={() => setOpen(true)} aria-label="打开工具导航"><Menu size={22} /></button>
        <div className="mobile-appbar__brand"><FlaskConical size={20} /><span>Epic7 Calc</span></div>
        <strong>{current.label}</strong>
      </header>

      {open && createPortal(<div className="mobile-drawer-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
        <aside className="mobile-drawer" role="dialog" aria-modal="true" aria-label="工具导航" onMouseDown={(event) => event.stopPropagation()}>
          <header><div><FlaskConical size={22} /><span><strong>Epic7 Calc</strong><small>移动版</small></span></div><button type="button" onClick={() => setOpen(false)} aria-label="关闭导航"><X size={21} /></button></header>
          <nav>{items.map((item) => {
            const Icon = item.icon;
            const active = item.page === page && (item.page === 'builds' || item.mode === calculatorMode);
            return <button type="button" key={`${item.page}-${item.mode || 'page'}`} className={active ? 'active' : ''} onClick={() => select(item)}>
              <span className="mobile-drawer__icon"><Icon size={20} /></span>
              <span><strong>{item.label}</strong><small>{item.caption}</small></span>
              <ChevronRight size={18} />
            </button>;
          })}</nav>
          <p>截图识别将在后续移动版本提供。</p>
        </aside>
      </div>, document.body)}
    </>
  );
}
