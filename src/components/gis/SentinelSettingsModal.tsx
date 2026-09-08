import React, { useState, useEffect } from 'react';
import {
  getStoredSentinelCredentials,
  saveSentinelCredentials,
  clearSentinelCredentials,
  fetchSentinelOAuthToken,
  SentinelCredentials,
} from '../../services/sentinelService';
import {
  Satellite,
  Key,
  Lock,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  ShieldCheck,
  Globe,
  ExternalLink,
  Trash2,
} from 'lucide-react';

interface SentinelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdated?: () => void;
}

export const SentinelSettingsModal: React.FC<SentinelSettingsModalProps> = ({
  isOpen,
  onClose,
  onCredentialsUpdated,
}) => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredSentinelCredentials();
      setClientId(stored.clientId || '');
      setClientSecret(stored.clientSecret || '');
      setTestStatus('IDLE');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      setTestStatus('ERROR');
      setErrorMessage('Please enter both OAuth Client ID and Client Secret.');
      return;
    }

    setIsTesting(true);
    setTestStatus('IDLE');
    setErrorMessage('');

    const token = await fetchSentinelOAuthToken({
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
    });

    setIsTesting(false);
    if (token && token.accessToken) {
      setTestStatus('SUCCESS');
      saveSentinelCredentials({
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
      });
      if (onCredentialsUpdated) onCredentialsUpdated();
    } else {
      setTestStatus('ERROR');
      setErrorMessage(
        'Authentication failed. Please verify your Copernicus Data Space Ecosystem credentials.'
      );
    }
  };

  const handleSave = () => {
    saveSentinelCredentials({
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
    });
    if (onCredentialsUpdated) onCredentialsUpdated();
    onClose();
  };

  const handleClear = () => {
    clearSentinelCredentials();
    setClientId('');
    setClientSecret('');
    setTestStatus('IDLE');
    if (onCredentialsUpdated) onCredentialsUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden space-y-0">
        {/* Modal Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Copernicus Sentinel-2 API Config</span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                  OAuth 2.0
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Authenticate with Copernicus Data Space Ecosystem (CDSE)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Copernicus Data Space Credentials</span>
            </div>
            <p className="text-[11px] text-blue-800">
              Enter your official Copernicus OAuth 2.0 Client ID and Secret to fetch real 10m Sentinel-2 multispectral imagery tiles.
            </p>
            <a
              href="https://dataspace.copernicus.eu"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline pt-0.5"
            >
              <span>Get Credentials at Copernicus Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span>OAuth Client ID</span>
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="e.g. cdse-client-id-xxxx-xxxx"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>OAuth Client Secret</span>
              </label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="••••••••••••••••••••••••"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Connection Test Status feedback */}
          {testStatus === 'SUCCESS' && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Copernicus OAuth Authenticated Successfully! Token Active.</span>
            </div>
          )}

          {testStatus === 'ERROR' && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Authentication Failed</span>
                <span className="text-[11px] text-rose-800 leading-tight">
                  {errorMessage || 'Unable to exchange OAuth tokens with CDSE identity server.'}
                </span>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              onClick={handleClear}
              className="px-3 py-2 text-slate-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Clear Saved Credentials"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Authenticating...' : 'Test Connection'}</span>
              </button>

              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Save Credentials</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
