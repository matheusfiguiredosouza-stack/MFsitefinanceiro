import { useState } from 'react';
import { Transaction, BudgetCategory } from '../types';
import { Lightbulb, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

interface AssistantProps {
  transactions: Transaction[];
  budget: BudgetCategory[];
  monthlyIncome: number;
}

export default function Assistant({ transactions, budget, monthlyIncome }: AssistantProps) {
  const [expanded, setExpanded] = useState(false);

  const generateTips = () => {
    const tips: string[] = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthTrans = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalExpenses = monthTrans.filter(t => t.type === 'saida' || t.type === 'pagamento').reduce((s, t) => s + t.amount, 0);
    const fixedExpenses = monthTrans.filter(t => (t.type === 'saida' || t.type === 'pagamento') && t.isFixed).reduce((s, t) => s + t.amount, 0);
    const debts = monthTrans.filter(t => t.category === 'Dívidas').reduce((s, t) => s + t.amount, 0);

    // Tip 1: Budget analysis
    const overBudget = budget.filter(b => b.limit > 0 && b.spent > b.limit);
    if (overBudget.length > 0) {
      tips.push(`⚠️ Você está acima do orçamento em ${overBudget.length} categoria(s): ${overBudget.map(b => b.name).join(', ')}. Tente reduzir gastos nessas áreas.`);
    }

    // Tip 2: Savings
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - totalExpenses) / monthlyIncome) * 100 : 0;
    if (savingsRate < 10 && monthlyIncome > 0) {
      tips.push(`💡 Sua taxa de economia está em ${savingsRate.toFixed(1)}%. O ideal é guardar pelo menos 10-20% da renda. Tente cortar gastos não essenciais.`);
    } else if (savingsRate >= 20) {
      tips.push(`🎉 Excelente! Você está economizando ${savingsRate.toFixed(1)}% da sua renda. Continue assim e considere investir o excedente!`);
    }

    // Tip 3: Fixed expenses
    if (monthlyIncome > 0 && fixedExpenses > monthlyIncome * 0.5) {
      tips.push(`🏠 Seus gastos fixos representam mais de 50% da renda. Avalie se é possível reduzir assinaturas ou negociar valores.`);
    }

    // Tip 4: Debts priority
    if (debts > 0) {
      tips.push(`💳 Você tem R$ ${debts.toFixed(2)} em dívidas este mês. Priorize quitar dívidas com juros mais altos primeiro (método avalanche).`);
    }

    // Tip 5: Payment dates
    const upcomingPayments = transactions
      .filter(t => (t.type === 'pagamento' || (t.type === 'saida' && t.isFixed)) && new Date(t.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);

    if (upcomingPayments.length > 0) {
      tips.push(`📅 Próximos pagamentos: ${upcomingPayments.map(p => `${p.description} (R$ ${p.amount.toFixed(2)})`).join(', ')}. Organize-se para não esquecer!`);
    }

    // Tip 6: Investment suggestion
    const availableForInvest = monthlyIncome - totalExpenses;
    if (availableForInvest > 100) {
      tips.push(`📈 Você tem R$ ${availableForInvest.toFixed(2)} disponível este mês. Considere investir em Tesouro Direto, CDB ou fundos de renda fixa para começar sua reserva.`);
    }

    // Tip 7: General tips
    const generalTips = [
      '🎯 Defina metas financeiras claras e acompanhe semanalmente. Metas pequenas geram grandes resultados!',
      '💰 Pague-se primeiro: separe o valor da poupança assim que receber o salário.',
      '📊 Revise suas assinaturas mensalmente. Cancele o que não usa.',
      '🛒 Antes de comprar, espere 24h. Se ainda quiser, avalie se cabe no orçamento.',
      '🏦 Mantenha uma reserva de emergência de 3-6 meses de despesas fixas.',
      '📱 Use a regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança/investimento.',
      '🎓 Invista em conhecimento financeiro. Livros como "Pai Rico, Pai Pobre" e "O Homem Mais Rico da Babilônia" são ótimos começos.',
      '⏰ Quanto antes começar a investir, maior o efeito dos juros compostos. Comece hoje!',
    ];

    if (tips.length < 4) {
      const randomTip = generalTips[Math.floor(Math.random() * generalTips.length)];
      tips.push(randomTip);
    }

    return tips.slice(0, 6);
  };

  const tips = generateTips();

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div
        className="p-5 cursor-pointer flex items-center gap-4 hover:bg-gray-700/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* 3D Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 relative">
            {/* Head */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Face */}
                <div className="w-12 h-14 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full relative shadow-lg">
                  {/* Hair - curly brown */}
                  <div className="absolute -top-2 -left-1 -right-1 h-7 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-full">
                    <div className="absolute top-0 left-1 w-2 h-2 bg-amber-700 rounded-full"></div>
                    <div className="absolute top-1 left-3 w-2 h-2 bg-amber-700 rounded-full"></div>
                    <div className="absolute top-0 left-5 w-2 h-2 bg-amber-700 rounded-full"></div>
                    <div className="absolute top-1 right-3 w-2 h-2 bg-amber-700 rounded-full"></div>
                    <div className="absolute top-0 right-1 w-2 h-2 bg-amber-700 rounded-full"></div>
                    <div className="absolute top-2 left-0 w-2 h-2 bg-amber-700 rounded-full"></div>
                    <div className="absolute top-2 right-0 w-2 h-2 bg-amber-700 rounded-full"></div>
                  </div>
                  {/* Eyes */}
                  <div className="absolute top-5 left-2.5 w-2 h-2 bg-gray-800 rounded-full"></div>
                  <div className="absolute top-5 right-2.5 w-2 h-2 bg-gray-800 rounded-full"></div>
                  {/* Glasses */}
                  <div className="absolute top-4 left-1 right-1 h-4 border-2 border-gray-700 rounded-md flex">
                    <div className="flex-1 border-r border-gray-700 rounded-l-md"></div>
                    <div className="flex-1 rounded-r-md"></div>
                  </div>
                  {/* Glasses bridge */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-1 h-0.5 bg-gray-700"></div>
                  {/* Beard */}
                  <div className="absolute bottom-0 left-1 right-1 h-5 bg-gradient-to-b from-amber-800 to-amber-900 rounded-b-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1 bg-amber-700 rounded-full"></div>
                  </div>
                  {/* Smile */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3 h-1.5 border-b-2 border-gray-700 rounded-b-full"></div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-emerald-400/10 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Assistente Financeiro</h3>
          </div>
          <p className="text-sm text-gray-400">Dicas personalizadas baseadas nas suas finanças</p>
        </div>

        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-700 pt-4">
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-700/30 rounded-lg p-3">
                <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-200">{tip}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
            <p className="text-xs text-emerald-300">
              💡 <strong>Dica do dia:</strong> Priorize pagar primeiro as contas com juros mais altos e datas mais próximas. 
              Depois organize as fixas e por último as variáveis. Assim você alivia a folha e fica despreocupado!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
