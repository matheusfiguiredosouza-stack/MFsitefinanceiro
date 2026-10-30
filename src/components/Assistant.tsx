import { useState, useMemo } from 'react';
import { Transaction, BudgetCategory } from '../types';
import { Lightbulb, ChevronDown, ChevronUp, MessageCircle, AlertTriangle, CheckCircle, Clock, TrendingUp, CreditCard, Calendar } from 'lucide-react';

interface AssistantProps {
  transactions: Transaction[];
  budget: BudgetCategory[];
  monthlyIncome: number;
}

interface PaymentPriority {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  priority: 'crítico' | 'alto' | 'médio' | 'baixo';
  reason: string;
  daysUntil: number;
}

export default function Assistant({ transactions, budget, monthlyIncome }: AssistantProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'prioridades' | 'dicas' | 'plano'>('prioridades');

  // Análise profunda dos dados financeiros
  const analysis = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTrans = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalIncome = monthTrans.filter(t => t.type === 'entrada' || t.type === 'recebimento').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = monthTrans.filter(t => t.type === 'saida' || t.type === 'pagamento').reduce((s, t) => s + t.amount, 0);
    const totalInvestments = monthTrans.filter(t => t.type === 'investimento').reduce((s, t) => s + t.amount, 0);

    // Contas a pagar (futuras ou em aberto)
    const pendingPayments = transactions
      .filter(t => (t.type === 'pagamento' || (t.type === 'saida' && t.isFixed)) && new Date(t.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Dívidas ativas
    const debts = transactions.filter(t => t.category === 'Dívidas' && t.type === 'saida');
    const totalDebts = debts.reduce((s, t) => s + t.amount, 0);

    // Assinaturas
    const subscriptions = transactions.filter(t => t.category === 'Assinaturas' && t.isFixed);
    const totalSubscriptions = subscriptions.reduce((s, t) => s + t.amount, 0);

    // Gastos por categoria no mês
    const categorySpending: Record<string, number> = {};
    monthTrans.forEach(t => {
      if (t.type === 'saida' || t.type === 'pagamento') {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      }
    });

    // Recebimentos futuros
    const futureIncome = transactions
      .filter(t => t.type === 'recebimento' && new Date(t.date) > now)
      .reduce((s, t) => s + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      totalInvestments,
      balance: totalIncome - totalExpenses - totalInvestments,
      pendingPayments,
      debts,
      totalDebts,
      subscriptions,
      totalSubscriptions,
      categorySpending,
      futureIncome,
      savingsRate: monthlyIncome > 0 ? ((monthlyIncome - totalExpenses) / monthlyIncome) * 100 : 0,
    };
  }, [transactions, budget, monthlyIncome]);

  // Sistema de priorização de pagamentos
  const paymentPriorities = useMemo((): PaymentPriority[] => {
    const now = new Date();
    const priorities: PaymentPriority[] = [];

    // 1. Contas com vencimento próximo (próximos 7 dias) - CRÍTICO
    analysis.pendingPayments.forEach(payment => {
      const paymentDate = new Date(payment.date);
      const daysUntil = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let priority: PaymentPriority['priority'] = 'baixo';
      let reason = '';

      if (daysUntil <= 3) {
        priority = 'crítico';
        reason = `Vence em ${daysUntil} dia(s)! Pague IMEDIATAMENTE para evitar juros e multa.`;
      } else if (daysUntil <= 7) {
        priority = 'alto';
        reason = `Vence em ${daysUntil} dias. Programe o pagamento para esta semana.`;
      } else if (daysUntil <= 15) {
        priority = 'médio';
        reason = `Vence em ${daysUntil} dias. Planeje-se para pagar a tempo.`;
      } else {
        priority = 'baixo';
        reason = `Vence em ${daysUntil} dias. Ainda há tempo, mas não esqueça.`;
      }

      // Dívidas e impostos são sempre mais prioritários
      if (payment.category === 'Dívidas' || payment.category === 'Impostos') {
        if (priority === 'baixo') priority = 'médio';
        if (priority === 'médio') priority = 'alto';
        reason = `⚡ ${payment.category} tem prioridade alta - evite acúmulo de juros! ${reason}`;
      }

      // Moradia é essencial
      if (payment.category === 'Moradia') {
        if (priority === 'baixo') priority = 'médio';
        reason = `🏠 Moradia é essencial. ${reason}`;
      }

      priorities.push({
        id: payment.id,
        description: payment.description,
        amount: payment.amount,
        date: payment.date,
        category: payment.category,
        priority,
        reason,
        daysUntil,
      });
    });

    // Ordenar: crítico > alto > médio > baixo, e dentro de cada grupo por data
    const order = { 'crítico': 0, 'alto': 1, 'médio': 2, 'baixo': 3 };
    priorities.sort((a, b) => {
      if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return priorities;
  }, [analysis]);

  // Gerar dicas inteligentes baseadas na análise
  const tips = useMemo(() => {
    const tipsList: { icon: string; text: string; type: 'warning' | 'success' | 'info' }[] = [];

    // Análise de orçamento
    const overBudget = budget.filter(b => b.limit > 0 && b.spent > b.limit);
    if (overBudget.length > 0) {
      tipsList.push({
        icon: '⚠️',
        text: `Você ultrapassou o limite em ${overBudget.length} categoria(s): ${overBudget.map(b => `${b.name} (R$ ${(b.spent - b.limit).toFixed(2)} acima)`).join(', ')}. Reduza gastos nessas áreas urgentemente.`,
        type: 'warning'
      });
    }

    // Taxa de economia
    if (monthlyIncome > 0) {
      if (analysis.savingsRate < 0) {
        tipsList.push({
          icon: '🚨',
          text: `ATENÇÃO: Você está gastando mais do que ganha! Déficit de R$ ${Math.abs(analysis.balance).toFixed(2)}. Revise urgentemente seus gastos.`,
          type: 'warning'
        });
      } else if (analysis.savingsRate < 10) {
        tipsList.push({
          icon: '💡',
          text: `Sua taxa de economia é ${analysis.savingsRate.toFixed(1)}%. O recomendado é mínimo 10%. Corte gastos supérfluos como lanches e lazer para aumentar.`,
          type: 'info'
        });
      } else if (analysis.savingsRate >= 20) {
        tipsList.push({
          icon: '🎉',
          text: `Excelente! Taxa de ${analysis.savingsRate.toFixed(1)}%. Você está no caminho certo! Considere investir o excedente em Tesouro Selic ou CDB.`,
          type: 'success'
        });
      }
    }

    // Dívidas
    if (analysis.totalDebts > 0) {
      tipsList.push({
        icon: '💳',
        text: `Você tem R$ ${analysis.totalDebts.toFixed(2)} em dívidas. PLANO DE AÇÃO: 1) Liste todas as dívidas com juros. 2) Pague primeiro a de juros mais alto (método avalanche). 3) Renegocie se possível. 4) Nunca faça dívida nova para pagar antiga.`,
        type: 'warning'
      });
    }

    // Assinaturas
    if (analysis.totalSubscriptions > monthlyIncome * 0.1 && monthlyIncome > 0) {
      tipsList.push({
        icon: '📱',
        text: `Suas assinaturas custam R$ ${analysis.totalSubscriptions.toFixed(2)}/mês (${((analysis.totalSubscriptions / monthlyIncome) * 100).toFixed(1)}% da renda). Revise: você usa todas? Cancele o que não usa!`,
        type: 'info'
      });
    }

    // Categoria mais gastadora
    const sortedCategories = Object.entries(analysis.categorySpending).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      tipsList.push({
        icon: '📊',
        text: `Sua maior categoria de gasto é "${topCategory}" com R$ ${topAmount.toFixed(2)}. Se ultrapassar o limite, foque em reduzir esta categoria primeiro.`,
        type: 'info'
      });
    }

    // Recebimentos futuros
    if (analysis.futureIncome > 0) {
      tipsList.push({
        icon: '💰',
        text: `Você tem R$ ${analysis.futureIncome.toFixed(2)} para receber em breve. Já planeje onde aplicar: ${analysis.totalDebts > 0 ? 'priorize quitar dívidas!' : 'separe para investimento/poupança!'}`,
        type: 'success'
      });
    }

    // Dicas gerais rotativas
    const generalTips = [
      { icon: '🎯', text: 'Regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança. Ajuste seus gastos a esta proporção.', type: 'info' as const },
      { icon: '🏦', text: 'Reserva de emergência: junte 3-6 meses de despesas fixas antes de investir em algo arriscado.', type: 'info' as const },
      { icon: '📈', text: 'Comece a investir mesmo com pouco! R$50/mês no Tesouro Selic já rende mais que a poupança.', type: 'info' as const },
      { icon: '🛒', text: 'Regra das 72 horas: antes de comprar algo não essencial, espere 3 dias. Se ainda quiser, avalie se cabe no orçamento.', type: 'info' as const },
      { icon: '💳', text: 'Evite parcelar compras do dia a dia. Parcelamento é dívida disfarçada que compromete sua renda futura.', type: 'info' as const },
      { icon: '📋', text: 'Anote TODOS os gastos, mesmo os pequenos. R$10/dia em café = R$300/mês que poderiam ser investidos!', type: 'info' as const },
    ];

    // Adicionar 1-2 dicas gerais
    const randomIndex = Math.floor(Math.random() * generalTips.length);
    tipsList.push(generalTips[randomIndex]);
    if (tipsList.length < 5) {
      const secondIndex = (randomIndex + 1) % generalTips.length;
      tipsList.push(generalTips[secondIndex]);
    }

    return tipsList;
  }, [analysis, budget, monthlyIncome]);

  // Plano de ação semanal
  const weeklyPlan = useMemo(() => {
    const now = new Date();
    const weekAhead = new Date(now);
    weekAhead.setDate(now.getDate() + 7);

    const thisWeekPayments = analysis.pendingPayments.filter(p => {
      const d = new Date(p.date);
      return d >= now && d <= weekAhead;
    });

    const totalThisWeek = thisWeekPayments.reduce((s, p) => s + p.amount, 0);
    const dailyAvg = totalThisWeek / 7;

    return {
      payments: thisWeekPayments,
      totalThisWeek,
      dailyAvg,
      availablePerDay: monthlyIncome > 0 ? (analysis.balance / 7) : 0,
    };
  }, [analysis, monthlyIncome]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'crítico': return 'bg-red-500/20 border-red-500 text-red-400';
      case 'alto': return 'bg-orange-500/20 border-orange-500 text-orange-400';
      case 'médio': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'baixo': return 'bg-blue-500/20 border-blue-500 text-blue-400';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'crítico': return <AlertTriangle className="w-4 h-4" />;
      case 'alto': return <Clock className="w-4 h-4" />;
      case 'médio': return <Calendar className="w-4 h-4" />;
      case 'baixo': return <CheckCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header com Avatar 3D */}
      <div
        className="p-5 cursor-pointer flex items-center gap-4 hover:bg-gray-700/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar 3D do Assistente */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 relative animate-float">
            {/* Corpo (camisa) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-6 bg-gradient-to-b from-emerald-600 to-emerald-700 rounded-t-lg rounded-b-sm"></div>
            
            {/* Pescoço */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-4 h-3 bg-amber-300 rounded-sm"></div>
            
            {/* Cabeça */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-16">
              {/* Rosto */}
              <div className="w-full h-full bg-gradient-to-b from-amber-200 to-amber-300 rounded-[50%] relative shadow-lg">
                {/* Cabelo cacheado castanho */}
                <div className="absolute -top-3 -left-1.5 -right-1.5 h-9 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-full overflow-hidden">
                  {/* Caches */}
                  <div className="absolute top-0 left-0 w-3 h-3 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-1 left-2.5 w-2.5 h-2.5 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-0 left-4 w-3 h-3 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-1 left-6.5 w-2.5 h-2.5 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-0 left-8 w-3 h-3 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-2 -left-0.5 w-2.5 h-2.5 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-2 -right-0.5 w-2.5 h-2.5 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-0 left-1.5 w-2 h-2 bg-amber-600 rounded-full"></div>
                  <div className="absolute top-0 right-2 w-2 h-2 bg-amber-600 rounded-full"></div>
                </div>

                {/* Sobrancelhas */}
                <div className="absolute top-5 left-2.5 w-3 h-0.5 bg-amber-800 rounded-full"></div>
                <div className="absolute top-5 right-2.5 w-3 h-0.5 bg-amber-800 rounded-full"></div>

                {/* Óculos */}
                <div className="absolute top-5.5 left-1.5 right-1.5 h-4 flex items-center gap-0.5">
                  <div className="flex-1 h-3.5 border-2 border-gray-800 rounded-md bg-white/10"></div>
                  <div className="w-1 h-0.5 bg-gray-800"></div>
                  <div className="flex-1 h-3.5 border-2 border-gray-800 rounded-md bg-white/10"></div>
                </div>

                {/* Olhos atrás dos óculos */}
                <div className="absolute top-7 left-3 w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                <div className="absolute top-7 right-3 w-1.5 h-1.5 bg-gray-800 rounded-full"></div>

                {/* Nariz */}
                <div className="absolute top-8.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-amber-400 rounded-full"></div>

                {/* Barba fechada */}
                <div className="absolute bottom-0 left-1 right-1 h-6 bg-gradient-to-b from-amber-800 to-amber-900 rounded-b-[50%]">
                  {/* Textura da barba */}
                  <div className="absolute top-1 left-1 w-1 h-1 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-2 left-2 w-1 h-1 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-1 right-1 w-1 h-1 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-2 right-2 w-1 h-1 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-3 left-3 w-1 h-1 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-3 right-3 w-1 h-1 bg-amber-700 rounded-full"></div>
                </div>

                {/* Sorriso (visível na barba) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3 h-1 border-b-2 border-amber-600 rounded-b-full"></div>
              </div>
            </div>

            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-emerald-400/5 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Assistente Financeiro MF</h3>
          </div>
          <p className="text-sm text-gray-400">
            {analysis.pendingPayments.length > 0
              ? `${analysis.pendingPayments.length} pagamento(s) pendente(s) • Análise completa disponível`
              : 'Analisando suas finanças...'}
          </p>
          {analysis.totalDebts > 0 && (
            <p className="text-xs text-red-400 mt-1">⚡ {analysis.totalDebts.toFixed(2)} em dívidas detectadas</p>
          )}
        </div>

        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </div>

      {/* Conteúdo Expandido */}
      {expanded && (
        <div className="border-t border-gray-700">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveSection('prioridades')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === 'prioridades' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-gray-700/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              🎯 Prioridades
            </button>
            <button
              onClick={() => setActiveSection('dicas')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === 'dicas' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-gray-700/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              💡 Dicas
            </button>
            <button
              onClick={() => setActiveSection('plano')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === 'plano' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-gray-700/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              📋 Plano Semanal
            </button>
          </div>

          <div className="p-5">
            {/* Seção Prioridades */}
            {activeSection === 'prioridades' && (
              <div className="space-y-4">
                <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2">📊 Resumo da Análise</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-xs text-gray-400">Saldo do Mês</p>
                      <p className={`text-sm font-bold ${analysis.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        R$ {analysis.balance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">A Pagar</p>
                      <p className="text-sm font-bold text-orange-400">
                        R$ {analysis.pendingPayments.reduce((s, p) => s + p.amount, 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Dívidas</p>
                      <p className="text-sm font-bold text-red-400">R$ {analysis.totalDebts.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">A Receber</p>
                      <p className="text-sm font-bold text-blue-400">R$ {analysis.futureIncome.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Ordem de Pagamento Recomendada
                </h4>

                {paymentPriorities.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhum pagamento pendente! Tudo em dia 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {paymentPriorities.map((payment, index) => (
                      <div
                        key={payment.id}
                        className={`rounded-lg p-3 border ${getPriorityColor(payment.priority)} transition-all`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <span className="text-lg font-bold opacity-50">#{index + 1}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                {getPriorityIcon(payment.priority)}
                                <p className="font-medium text-sm">{payment.description}</p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold ${getPriorityColor(payment.priority)}`}>
                                  {payment.priority}
                                </span>
                              </div>
                              <p className="text-xs opacity-80 mt-1">{payment.reason}</p>
                              <p className="text-xs opacity-60 mt-0.5">
                                {payment.category} • Vence: {new Date(payment.date).toLocaleDateString('pt-BR')} ({payment.daysUntil} dias)
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-sm whitespace-nowrap">R$ {payment.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {paymentPriorities.filter(p => p.priority === 'crítico').length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-4">
                    <p className="text-sm text-red-300">
                      🚨 <strong>URGENTE:</strong> Você tem {paymentPriorities.filter(p => p.priority === 'crítico').length} pagamento(s) 
                      que vencem em até 3 dias. Pague agora para evitar juros e multas!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Seção Dicas */}
            {activeSection === 'dicas' && (
              <div className="space-y-3">
                {tips.map((tip, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 border ${
                      tip.type === 'warning' ? 'bg-red-500/10 border-red-500/30' :
                      tip.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
                      'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{tip.icon}</span>
                      <p className="text-sm text-gray-200">{tip.text}</p>
                    </div>
                  </div>
                ))}

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2">🏦 Estratégia de Investimento Gradual</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>1. <strong>Reserva de Emergência:</strong> Junte 3-6 meses de despesas em Tesouro Selic ou CDB liquidez diária.</p>
                    <p>2. <strong>Renda Fixa:</strong> Após a reserva, diversifique em CDBs, LCIs e LCAs.</p>
                    <p>3. <strong>Renda Variável:</strong> Com base sólida, considere fundos imobiliários e ações aos poucos.</p>
                    <p>4. <strong>Automação:</strong> Configure débito automático no dia do salário para investir sem pensar.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Seção Plano Semanal */}
            {activeSection === 'plano' && (
              <div className="space-y-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-3">📅 Plano de Pagamento da Semana</h4>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-600/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">Total a pagar esta semana</p>
                      <p className="text-lg font-bold text-orange-400">R$ {weeklyPlan.totalThisWeek.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-600/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">Média diária necessária</p>
                      <p className="text-lg font-bold text-blue-400">R$ {weeklyPlan.dailyAvg.toFixed(2)}</p>
                    </div>
                  </div>

                  {weeklyPlan.payments.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 mb-2">Pagamentos desta semana:</p>
                      {weeklyPlan.payments.map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-gray-600/20 rounded p-2">
                          <div>
                            <p className="text-sm">{p.description}</p>
                            <p className="text-xs text-gray-400">{new Date(p.date).toLocaleDateString('pt-BR')} • {p.category}</p>
                          </div>
                          <span className="text-sm font-medium text-orange-400">R$ {p.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4 text-sm">Nenhum pagamento programado para esta semana 🎉</p>
                  )}
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2">✅ Estratégia de Alívio da Folha</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong>Passo 1:</strong> Pague primeiro as contas com vencimento mais próximo (evita juros).</p>
                    <p><strong>Passo 2:</strong> Quite dívidas com juros mais altos (método avalanche).</p>
                    <p><strong>Passo 3:</strong> Pague gastos fixos essenciais (moradia, alimentação).</p>
                    <p><strong>Passo 4:</strong> Reserve o valor da poupança (pague-se primeiro!).</p>
                    <p><strong>Passo 5:</strong> O que sobrar é gasto livre. Aproveite sem culpa!</p>
                  </div>
                </div>

                {analysis.totalDebts > 0 && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">💳 Plano de Quitação de Dívidas</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>Total em dívidas: <strong className="text-red-400">R$ {analysis.totalDebts.toFixed(2)}</strong></p>
                      <p>1. Liste TODAS as dívidas com valor e taxa de juros.</p>
                      <p>2. Pague o mínimo de todas, exceto a de maior juro.</p>
                      <p>3. Na de maior juro, pague o máximo possível.</p>
                      <p>4. Quando quitar uma, use o valor para acelerar a próxima.</p>
                      <p>5. <strong>NUNCA</strong> faça nova dívida para pagar outra!</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
