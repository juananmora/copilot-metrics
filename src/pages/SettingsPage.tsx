import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Settings, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Save,
  Trash2,
  Shield,
  Server,
  Building2
} from 'lucide-react';
import { getStoredToken, setStoredToken, clearStoredToken, validateToken, hasToken, TokenInfo } from '../services/tokenService';

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [hasStoredToken, setHasStoredToken] = useState(false);

  useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      setToken(stored);
      setHasStoredToken(true);
      // Validate on load
      handleValidate(stored);
    }
  }, []);

  const handleValidate = async (tokenToValidate?: string) => {
    const t = tokenToValidate || token;
    if (!t.trim()) {
      setMessage({ type: 'warning', text: 'Introduce un token para validar' });
      return;
    }

    setIsValidating(true);
    setMessage(null);

    try {
      const info = await validateToken(t);
      setTokenInfo(info);
      
      if (info.valid) {
        setMessage({ type: 'success', text: `Token válido. Conectado como ${info.user || 'usuario'}` });
      } else {
        setMessage({ type: 'error', text: info.error || 'Token inválido o sin permisos suficientes' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al validar el token' });
      setTokenInfo(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!token.trim()) {
      setMessage({ type: 'warning', text: 'Introduce un token para guardar' });
      return;
    }

    // Try to validate, but save anyway even if validation fails (network may be unreachable)
    setIsValidating(true);
    try {
      const info = await validateToken(token);
      setStoredToken(token);
      setHasStoredToken(true);
      setTokenInfo(info);
      
      if (info.valid) {
        setMessage({ type: 'success', text: `Token guardado y validado correctamente (${info.user || 'usuario'}). Los datos se recargarán automáticamente.` });
      } else {
        setMessage({ type: 'warning', text: `Token guardado, pero no se pudo validar: ${info.error || 'error desconocido'}. Se intentará usar igualmente.` });
      }
      
      // Invalidate all queries to refetch with new token
      queryClient.invalidateQueries();
    } catch {
      // Save anyway even if validation request itself fails
      setStoredToken(token);
      setHasStoredToken(true);
      setMessage({ type: 'warning', text: 'Token guardado, pero no se pudo conectar al servidor para validarlo. Se intentará usar igualmente.' });
      queryClient.invalidateQueries();
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    clearStoredToken();
    setToken('');
    setHasStoredToken(false);
    setTokenInfo(null);
    const envTokenExists = !!(import.meta.env.VITE_GITHUB_TOKEN as string | undefined)?.trim();
    setMessage({ 
      type: 'warning', 
      text: envTokenExists 
        ? 'Token de Settings eliminado. Se usará el token del fichero .env como fallback.' 
        : 'Token eliminado. Se usarán datos de demostración (mock).' 
    });
    queryClient.invalidateQueries();
  };

  const maskToken = (t: string) => {
    if (t.length <= 8) return '••••••••';
    return t.substring(0, 4) + '••••••••••••••••' + t.substring(t.length - 4);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A100FF] to-[#7500C0] flex items-center justify-center shadow-lg">
          <Settings className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-400">Gestiona tu token de acceso a GitHub Enterprise</p>
        </div>
      </div>

      {/* Token Configuration Card */}
      <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg border border-[#E5E7EB] overflow-hidden">
        <div className="bg-gradient-to-r from-[#A100FF]/20 to-[#7500C0]/20 px-6 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-[#A100FF]" />
            <h2 className="text-lg font-semibold text-gray-900">Token de Acceso Personal (PAT)</h2>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Configura tu token para acceder a la API de GitHub Enterprise
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Info boxes */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#A100FF]/10 rounded-xl p-4 border border-[#A100FF]/30">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#A100FF] mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#A100FF]">Permisos necesarios</h4>
                  <ul className="text-sm text-gray-400 mt-1 space-y-1">
                    <li>• <code className="bg-[#A100FF]/20 px-1 rounded text-[#A100FF]">repo</code> - Acceso a repositorios</li>
                    <li>• <code className="bg-[#A100FF]/20 px-1 rounded text-[#A100FF]">read:org</code> - Leer organización</li>
                    <li>• <code className="bg-[#A100FF]/20 px-1 rounded text-[#A100FF]">copilot</code> - Métricas de Copilot</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#FFB800]/10 rounded-xl p-4 border border-[#FFB800]/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#FFB800] mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#FFB800]">Seguridad</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    El token se almacena en localStorage de tu navegador. 
                    Solo tú puedes acceder a él desde este dispositivo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Token input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Token de GitHub
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 pr-24 border border-[#E5E7EB] bg-[#F9FAFB] rounded-xl focus:ring-2 
                         focus:ring-[#A100FF]/30 focus:border-[#A100FF] transition-all
                         font-mono text-sm text-gray-900 placeholder-gray-500"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 
                         hover:text-gray-300 transition-colors"
                title={showToken ? 'Ocultar token' : 'Mostrar token'}
              >
                {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {hasStoredToken && !showToken && (
              <p className="text-sm text-gray-500">
                Token actual: <code className="bg-[#E5E7EB] px-2 py-0.5 rounded text-gray-300">{maskToken(token)}</code>
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleValidate()}
              disabled={isValidating || !token.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#E5E7EB] hover:bg-[#4b5563] 
                       text-gray-300 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
              Validar
            </button>
            
            <button
              onClick={handleSave}
              disabled={isValidating || !token.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#A100FF] hover:bg-[#0e7cc7] 
                       text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Guardar Token
            </button>

            {hasStoredToken && (
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 
                         text-red-400 rounded-xl transition-all ml-auto border border-red-500/30"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Token
              </button>
            )}
          </div>

          {/* Message */}
          {message && (
            <div className={`flex items-center gap-3 p-4 rounded-xl ${
              message.type === 'success' ? 'bg-[#00A551]/20 text-[#00A551] border border-[#00A551]/30' :
              message.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30'
            }`}>
              {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {message.type === 'error' && <XCircle className="w-5 h-5" />}
              {message.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Token Info */}
          {tokenInfo && tokenInfo.valid && (
            <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#00A551]" />
                Información del Token
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Server className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Servidor</p>
                    <p className="font-medium text-gray-900">{tokenInfo.server || 'GitHub Enterprise'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Organización</p>
                    <p className="font-medium text-gray-900">{tokenInfo.organization || 'copilot-full-capacity'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Usuario</p>
                    <p className="font-medium text-gray-900">{tokenInfo.user || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Token Source Info */}
      <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg border border-[#E5E7EB] p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-[#A100FF]" />
          Origen del Token (Prioridad)
        </h3>
        <div className="space-y-3">
          {[
            {
              priority: 1,
              label: 'Settings (esta página)',
              description: 'Token guardado en el navegador (localStorage)',
              active: hasStoredToken,
            },
            {
              priority: 2,
              label: 'Variable de entorno',
              description: 'VITE_GITHUB_TOKEN en el fichero .env',
              active: !hasStoredToken && !!(import.meta.env.VITE_GITHUB_TOKEN as string | undefined)?.trim(),
            },
            {
              priority: 3,
              label: 'Datos mock (demo)',
              description: 'Sin token configurado → se usan datos de demostración',
              active: !hasToken(),
            },
          ].map((source) => (
            <div
              key={source.priority}
              className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                source.active
                  ? 'bg-[#A100FF]/5 border-[#A100FF]/30'
                  : 'bg-gray-50 border-gray-100 opacity-60'
              }`}
            >
              <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                source.active
                  ? 'bg-[#A100FF] text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {source.priority}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${source.active ? 'text-gray-900' : 'text-gray-500'}`}>
                  {source.label}
                </p>
                <p className="text-sm text-gray-400 truncate">{source.description}</p>
              </div>
              {source.active && (
                <CheckCircle className="w-5 h-5 text-[#00A551] flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg border border-[#E5E7EB] p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Cómo obtener un token?</h3>
        <ol className="space-y-3 text-gray-400">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#A100FF] text-white text-sm flex items-center justify-center">1</span>
            <span>Accede a <strong className="text-gray-900">GitHub Enterprise → Settings → Developer settings → Personal access tokens</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#A100FF] text-white text-sm flex items-center justify-center">2</span>
            <span>Haz clic en <strong className="text-gray-900">"Generate new token (classic)"</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#A100FF] text-white text-sm flex items-center justify-center">3</span>
            <span>Selecciona los permisos: <code className="bg-[#E5E7EB] px-1 rounded text-[#A100FF]">repo</code>, <code className="bg-[#E5E7EB] px-1 rounded text-[#A100FF]">read:org</code>, <code className="bg-[#E5E7EB] px-1 rounded text-[#A100FF]">copilot</code></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#A100FF] text-white text-sm flex items-center justify-center">4</span>
            <span>Copia el token generado y pégalo en el campo de arriba</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
