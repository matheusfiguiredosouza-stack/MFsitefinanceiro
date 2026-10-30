interface SpendingRingProps {
  weekSpending: { date: string; amount: number; dayName: string }[];
  dailyBudget: number;
}

export default function SpendingRing({ weekSpending, dailyBudget }: SpendingRingProps) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const getStatus = (amount: number, dateStr: string) => {
    if (dateStr > todayStr) return 'future'; // dia que ainda não chegou
    if (amount === 0) return 'none'; // sem gasto
    if (amount > dailyBudget) return 'over'; // estourou
    return 'ok'; // dentro do limite
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500';
      case 'over': return 'text-red-400 bg-red-500/20 border-red-500';
      case 'none': return 'text-gray-400 bg-gray-600/30 border-gray-600';
      case 'future': return 'text-gray-500 bg-gray-700/30 border-gray-700';
      default: return 'text-gray-400 bg-gray-600/30 border-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ok': return '✓ Dentro';
      case 'over': return '✗ Estourou';
      case 'none': return '— Sem gasto';
      case 'future': return '⏳ Futuro';
      default: return '';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-lg font-semibold mb-2">🎯 Anel de Gastos da Semana</h3>
      <p className="text-sm text-gray-400 mb-4">
        Comparação do gasto livre diário com a média disponível.
        <span className="text-emerald-400 ml-1">Verde</span> = dentro do limite |
        <span className="text-red-400 ml-1">Vermelho</span> = estourou |
        <span className="text-gray-400 ml-1">Cinza</span> = sem gasto/futuro
      </p>

      {/* Ring visualization */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {weekSpending.map((day, i) => {
              const status = getStatus(day.amount, day.date);
              const color = status === 'ok' ? '#10b981' : status === 'over' ? '#ef4444' : '#4b5563';
              const angle = (360 / 7) * i;
              const startAngle = (angle * Math.PI) / 180;
              const endAngle = ((angle + 360 / 7 - 2) * Math.PI) / 180;
              const largeArc = 360 / 7 - 2 > 180 ? 1 : 0;

              const x1 = 50 + 40 * Math.cos(startAngle);
              const y1 = 50 + 40 * Math.sin(startAngle);
              const x2 = 50 + 40 * Math.cos(endAngle);
              const y2 = 50 + 40 * Math.sin(endAngle);

              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity={status === 'future' ? 0.3 : 1}
                />
              );
            })}
            <circle cx="50" cy="50" r="30" fill="none" stroke="#374151" strokeWidth="1" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-gray-400">Livre/dia</span>
            <span className="text-lg font-bold text-emerald-400">R$ {dailyBudget.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Day cards */}
      <div className="grid grid-cols-7 gap-2">
        {weekSpending.map((day, i) => {
          const status = getStatus(day.amount, day.date);
          const isToday = day.date === todayStr;
          return (
            <div
              key={i}
              className={`rounded-lg p-3 border text-center transition-all ${getStatusColor(status)} ${isToday ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-gray-800' : ''}`}
            >
              <p className="text-xs font-medium mb-1">{day.dayName}</p>
              <p className="text-sm font-bold">R$ {day.amount.toFixed(0)}</p>
              <p className="text-[10px] mt-1 opacity-80">{getStatusLabel(status)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
