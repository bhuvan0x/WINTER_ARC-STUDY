import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded border border-violet-500/40 bg-violet-950/30 text-violet-200 hover:bg-violet-900/50 hover:border-violet-400 transition-colors shadow-sm"
        title="Install Winter Arc System as offline PWA"
      >
        <Download className="w-3.5 h-3.5 text-violet-400" />
        <span>INSTALL OS</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded border border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 transition-colors"
          title="Install on iOS Home Screen"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span>INSTALL PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded border border-slate-800 bg-[#0d0f18] p-5 shadow-2xl font-mono text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs uppercase tracking-wider text-violet-400 font-bold">iOS INSTALLATION PROTOCOL</span>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-slate-300">
                <p>To run Winter Arc completely offline as a native application:</p>
                <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                  <p>1. Tap Safari's <strong>Share</strong> button (bottom toolbar).</p>
                  <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                  <p>3. Tap <strong>Add</strong> in the top right.</p>
                </div>
                <p className="text-[11px] text-slate-400">Offline database and biometric lock will remain preserved.</p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded border border-violet-500/50 bg-violet-900/30 py-2 text-xs font-medium text-violet-200 hover:bg-violet-900/60"
              >
                ACKNOWLEDGED
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
