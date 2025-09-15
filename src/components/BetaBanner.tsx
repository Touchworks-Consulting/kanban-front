import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    // Verifica se o usuário já fechou o banner antes
    return !localStorage.getItem('beta-banner-dismissed');
  });

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('beta-banner-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Sparkles className="h-6 w-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Versão Beta - Gratuita!
            </h3>
            <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
              Você está usando nossa versão <strong>beta gratuita</strong>! Durante este período,
              todas as funcionalidades estão disponíveis sem custo. Aproveite para explorar
              o sistema e nos enviar seu feedback. Após esse período será necessário contratar um plano. 
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium">
                ✓ Usuários Ilimitados
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium">
                ✓ Leads Ilimitados
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium">
                ✓ Todas as Funcionalidades
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 inline-flex text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}