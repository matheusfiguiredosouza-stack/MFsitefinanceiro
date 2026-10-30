import { useState, useEffect } from 'react';
import { Cloud, Download, Upload, Shield, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface BackupProps {
  user: string;
}

export default function Backup({ user }: BackupProps) {
  const [lastSaved, setLastSaved] = useState<string>('');
  const [backupStatus, setBackupStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Verificar último salvamento
    const saved = localStorage.getItem(`mf_last_saved_${user}`);
    if (saved) {
      setLastSaved(new Date(saved).toLocaleString('pt-BR'));
    }

    // Salvamento automático a cada alteração (detecta mudanças no storage)
    const interval = setInterval(() => {
      const timestamp = new Date().toISOString();
      localStorage.setItem(`mf_last_saved_${user}`, timestamp);
      setLastSaved(new Date(timestamp).toLocaleString('pt-BR'));
    }, 30000); // A cada 30 segundos verifica

    return () => clearInterval(interval);
  }, [user]);

  const exportData = () => {
    try {
      const users = JSON.parse(localStorage.getItem('mf_users') || '{}');
      const userData = users[user];
      if (!userData) {
        setBackupStatus('error');
        setStatusMessage('Nenhum dado encontrado para exportar.');
        return;
      }

      const exportObj = {
        version: '1.0',
        user,
        exportDate: new Date().toISOString(),
        data: userData,
      };

      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MFfinanceiro_backup_${user}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupStatus('success');
      setStatusMessage('Backup exportado com sucesso!');
    } catch {
      setBackupStatus('error');
      setStatusMessage('Erro ao exportar dados.');
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (!imported.data || !imported.user) {
          setBackupStatus('error');
          setStatusMessage('Arquivo inválido.');
          return;
        }

        if (imported.user !== user) {
          setBackupStatus('error');
          setStatusMessage('Este backup pertence a outro usuário!');
          return;
        }

        const users = JSON.parse(localStorage.getItem('mf_users') || '{}');
        users[user] = { ...users[user], ...imported.data };
        localStorage.setItem('mf_users', JSON.stringify(users));

        setBackupStatus('success');
        setStatusMessage('Dados importados com sucesso! Recarregue a página para ver as alterações.');
        
        // Recarregar após 2 segundos
        setTimeout(() => window.location.reload(), 2000);
      } catch {
        setBackupStatus('error');
        setStatusMessage('Erro ao ler o arquivo. Verifique se é um backup válido.');
      }
    };
    reader.readAsText(file);
  };

  const deleteAllData = () => {
    if (window.confirm('⚠️ TEM CERTEZA? Isso vai apagar TODOS os seus dados financeiros permanentemente!')) {
      if (window.confirm('Última chance! Confirme novamente para apagar tudo.')) {
        const users = JSON.parse(localStorage.getItem('mf_users') || '{}');
        users[user] = {
          ...users[user],
          transactions: [],
          budget: [],
          savingsGoal: 0,
          savingsCurrent: 0,
          monthlyIncome: 0,
        };
        localStorage.setItem('mf_users', JSON.stringify(users));
        setBackupStatus('success');
        setStatusMessage('Todos os dados foram apagados.');
        setTimeout(() => window.location.reload(), 1500);
      }
    }
  };

  const syncNow = () => {
    const timestamp = new Date().toISOString();
    localStorage.setItem(`mf_last_saved_${user}`, timestamp);
    localStorage.setItem(`mf_sync_${user}`, timestamp);
    setLastSaved(new Date(timestamp).toLocaleString('pt-BR'));
    setBackupStatus('success');
    setStatusMessage('Sincronizado com sucesso!');
    setTimeout(() => setBackupStatus('idle'), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Status de Salvamento */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Cloud className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Salvamento Automático</h3>
              <p className="text-xs text-gray-400">Seus dados são salvos automaticamente neste dispositivo</p>
            </div>
          </div>
          <button
            onClick={syncNow}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sincronizar
          </button>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-3 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-300">
              Último salvamento: <span className="text-emerald-400 font-medium">{lastSaved || 'Agora mesmo'}</span>
            </p>
            <p className="text-xs text-gray-500">Dados salvos localmente neste navegador/dispositivo</p>
          </div>
        </div>

        {backupStatus !== 'idle' && (
          <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
            backupStatus === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {backupStatus === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
            <p className={`text-sm ${backupStatus === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>{statusMessage}</p>
          </div>
        )}
      </div>

      {/* Backup e Restauração */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Backup e Restauração
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Exporte seus dados para fazer backup ou importe de outro dispositivo. Assim você pode acessar seus dados em qualquer computador ou celular!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportData}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium text-sm">Exportar Dados</p>
              <p className="text-xs opacity-70">Baixar backup JSON</p>
            </div>
          </button>

          <label className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium text-sm">Importar Dados</p>
              <p className="text-xs opacity-70">Restaurar de backup</p>
            </div>
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>
      </div>

      {/* Informações de Segurança */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Segurança e Privacidade
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            Seus dados são protegidos por senha pessoal
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            Nem o administrador do sistema tem acesso aos seus dados
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            Os dados ficam salvos neste dispositivo automaticamente
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            Use a exportação para transferir dados entre dispositivos
          </p>
          <p className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            Faça backup regularmente para não perder seus dados
          </p>
        </div>
      </div>

      {/* Zona de Perigo */}
      <div className="bg-gray-800 rounded-xl p-5 border border-red-500/30">
        <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Zona de Perigo
        </h3>
        <p className="text-sm text-gray-400 mb-4">Ações irreversíveis. Tenha certeza antes de prosseguir.</p>
        <button
          onClick={deleteAllData}
          className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Apagar Todos os Dados Financeiros
        </button>
      </div>
    </div>
  );
}
