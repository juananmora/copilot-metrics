import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait a bit before showing the prompt
      setTimeout(() => setShowPrompt(true), 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || dismissed || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#001891] to-[#004481] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Download className="w-5 h-5" />
            <span className="font-semibold">Instalar App</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600 text-sm mb-4">
            Instala <strong>Copilot Metrics</strong> en tu dispositivo para acceso rápido y una mejor experiencia.
          </p>
          
          {/* Benefits */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Smartphone className="w-4 h-4 text-[#04E26A]" />
              <span>Móvil</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Monitor className="w-4 h-4 text-[#04E26A]" />
              <span>Escritorio</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 
                       rounded-xl text-sm font-medium transition-colors"
            >
              Ahora no
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-2.5 text-white bg-[#001891] hover:bg-[#001070] 
                       rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Instalar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
