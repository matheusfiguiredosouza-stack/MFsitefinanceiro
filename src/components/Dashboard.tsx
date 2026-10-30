import { useState, useEffect } from 'react';
import { Transaction, BudgetCategory, CATEGORIES } from '../types';
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, LogOut,
  Plus, Trash2, BarChart3, Target, History, DollarSign,
  ArrowUpCircle, ArrowDownCircle, CreditCard, Building2
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import Assistant from './Assistant';
import SpendingRing from './SpendingRing';

interface DashboardProps {
  user: string;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<BudgetCategory[]>([]);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [savingsCurrent, setSavingsCurrent] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);

  // Form states
  const [newTransaction, setNewTransaction] = useState({
    type: 'saida' as Transaction['type'],
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    isFixed: false,
    isInstallment: false,
    futureDate: '',
  });

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('mf_users') || '{}');
    const userData = users[user];
    if (userData) {
      setTransactions(userData.transactions || []);
      setBudget(userData.budget || CATEGORIES.map(c => ({ name: c, limit: 0, spent: 0 })));
      setSavingsGoal(userData.savingsGoal || 0);
      setSavingsCurrent(userData.savingsCurrent || 0);
      setMonthlyIncome(userData.monthlyIncome || 0);
    }
  }, [user]);

  const saveData = (data: Partial<{ transactions: Transaction[]; budget: BudgetCategory[]; savingsGoal: number; savingsCurrent: number; monthlyIncome: number }>) => {
    const users = JSON.parse(localStorage.getItem('mf_users') || '{}');
    if (!users[user]) return;
    users[user] = { ...users[user], ...data };
    localStorage.setItem('mf_users', JSON.stringify(users));
  };

  const addTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount) return;
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type,
      category: newTransaction.category || 'Outros',
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      date: newTransaction.date,
      isFixed: newTransaction.isFixed,
      isInstallment: newTransaction.isInstallment,
      futureDate: newTransaction.futureDate || undefined,
    };
    const updated = [...transactions, transaction];
    setTransactions(updated);
    saveData({ transactions: updated });
    setNewTransaction({ type: 'saida', category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], isFixed: false, isInstallment: false, futureDate: '' });
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveData({ transactions: updated });
  };

  const updateBudgetLimit = (index: number, limit: number) => {
    const updated = [...budget];
    updated[index] = { ...updated[index], limit };
    setBudget(updated);
    saveData({ budget: updated });
  };

  // Calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = monthTransactions.filter(t => t.type === 'entrada' || t.type === 'recebimento').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = monthTransactions.filter(t => t.type === 'saida' || t.type === 'pagamento').reduce((s, t) => s + t.amount, 0);
  const totalInvestments = monthTransactions.filter(t => t.type === 'investimento').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses - totalInvestments;

  // Budget spent calculation
  const budgetWithSpent = budget.map(b => {
    const spent = monthTransactions
      .filter(t => t.category === b.name && (t.type === 'saida' || t.type === 'pagamento'))
      .reduce((s, t) => s + t.amount, 0);
    return { ...b, spent };
  });

  // Free spending calculation (non-fixed, non-installment)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyBudget = monthlyIncome > 0 ? (monthlyIncome - totalExpenses) / (daysInMonth - today.getDate() + 1) : 0;

  const weekSpending = weekDays.map(day => {
    const dateStr = day.toISOString().split('T')[0];
    const freeSpending = transactions
      .filter(t => t.date === dateStr && (t.type === 'saida' || t.type === 'pagamento') && !t.isFixed && !t.isInstallment)
      .reduce((s, t) => s + t.amount, 0);
    return { date: dateStr, amount: freeSpending, dayName: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day.getDay()] };
  });

  // Chart data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthTrans = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === i && d.getFullYear() === currentYear;
    });
    const income = monthTrans.filter(t => t.type === 'entrada' || t.type === 'recebimento').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTrans.filter(t => t.type === 'saida' || t.type === 'pagamento').reduce((s, t) => s + t.amount, 0);
    return {
      month: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
      entradas: income,
      saidas: expenses,
      saldo: income - expenses,
    };
  });

  const categoryData = budgetWithSpent
    .filter(b => b.spent > 0)
    .map(b => ({ name: b.name, value: b.spent }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#e11d48'];

  const tabs = [
    { id: 'dashboard', label: 'Painel', icon: BarChart3 },
    { id: 'transactions', label: 'Transações', icon: DollarSign },
    { id: 'budget', label: 'Orçamento', icon: Target },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'investments', label: 'Investimentos', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <h1 className="text-xl font-bold text-emerald-400">MFfinanceiro</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Olá, <span className="text-emerald-400 font-medium">{user}</span></span>
            <button onClick={onLogout} className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800/50 border-b border-gray-700 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
                  <span className="text-sm text-gray-400">Entradas</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">R$ {totalIncome.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-500/20 rounded-lg"><TrendingDown className="w-5 h-5 text-red-400" /></div>
                  <span className="text-sm text-gray-400">Saídas</span>
                </div>
                <p className="text-2xl font-bold text-red-400">R$ {totalExpenses.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg"><Wallet className="w-5 h-5 text-blue-400" /></div>
                  <span className="text-sm text-gray-400">Saldo</span>
                </div>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>R$ {balance.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg"><PiggyBank className="w-5 h-5 text-purple-400" /></div>
                  <span className="text-sm text-gray-400">Poupança</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">R$ {savingsCurrent.toFixed(2)} / {savingsGoal.toFixed(2)}</p>
              </div>
            </div>

            {/* Income Config */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">💵 Renda Mensal</h3>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={monthlyIncome || ''}
                  onChange={(e) => { const v = parseFloat(e.target.value) || 0; setMonthlyIncome(v); saveData({ monthlyIncome: v }); }}
                  placeholder="Digite sua renda mensal"
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-400">
                  Livre diário: <span className="text-emerald-400 font-medium">R$ {dailyBudget.toFixed(2)}</span>
                </span>
              </div>
            </div>

            {/* Spending Ring */}
            <SpendingRing weekSpending={weekSpending} dailyBudget={dailyBudget} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">📊 Comparativo Mensal</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="entradas" fill="#10b981" name="Entradas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="saidas" fill="#ef4444" name="Saídas" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">🥧 Gastos por Categoria</h3>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-center py-12">Nenhum gasto registrado neste mês</p>
                )}
              </div>
            </div>

            {/* Savings Goal */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">🎯 Meta de Poupança</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Meta</label>
                  <input
                    type="number"
                    value={savingsGoal || ''}
                    onChange={(e) => { const v = parseFloat(e.target.value) || 0; setSavingsGoal(v); saveData({ savingsGoal: v }); }}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Atual</label>
                  <input
                    type="number"
                    value={savingsCurrent || ''}
                    onChange={(e) => { const v = parseFloat(e.target.value) || 0; setSavingsCurrent(v); saveData({ savingsCurrent: v }); }}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progresso</span>
                  <span className="text-emerald-400">{savingsGoal > 0 ? ((savingsCurrent / savingsGoal) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${savingsGoal > 0 ? Math.min((savingsCurrent / savingsGoal) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Assistant */}
            <Assistant transactions={transactions} budget={budgetWithSpent} monthlyIncome={monthlyIncome} />
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">➕ Nova Transação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as Transaction['type'] })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="entrada">💰 Entrada</option>
                  <option value="saida">💸 Saída</option>
                  <option value="investimento">📈 Investimento</option>
                  <option value="pagamento">💳 Pagamento</option>
                  <option value="recebimento">📥 Recebimento Futuro</option>
                </select>

                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Selecione categoria</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <input
                  type="text"
                  placeholder="Descrição"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <input
                  type="number"
                  placeholder="Valor (R$)"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" checked={newTransaction.isFixed} onChange={(e) => setNewTransaction({ ...newTransaction, isFixed: e.target.checked })} className="rounded" />
                    Fixo
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" checked={newTransaction.isInstallment} onChange={(e) => setNewTransaction({ ...newTransaction, isInstallment: e.target.checked })} className="rounded" />
                    Parcela
                  </label>
                </div>
              </div>

              <button
                onClick={addTransaction}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>

            {/* Transactions List */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">📋 Transações do Mês</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {monthTransactions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Nenhuma transação neste mês</p>
                ) : (
                  monthTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          t.type === 'entrada' || t.type === 'recebimento' ? 'bg-emerald-500/20' :
                          t.type === 'investimento' ? 'bg-blue-500/20' : 'bg-red-500/20'
                        }`}>
                          {t.type === 'entrada' || t.type === 'recebimento' ? <ArrowUpCircle className="w-4 h-4 text-emerald-400" /> :
                           t.type === 'investimento' ? <Building2 className="w-4 h-4 text-blue-400" /> :
                           <ArrowDownCircle className="w-4 h-4 text-red-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t.description}</p>
                          <p className="text-xs text-gray-400">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}
                            {t.isFixed && ' • Fixo'}{t.isInstallment && ' • Parcela'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${
                          t.type === 'entrada' || t.type === 'recebimento' ? 'text-emerald-400' :
                          t.type === 'investimento' ? 'text-blue-400' : 'text-red-400'
                        }`}>
                          {t.type === 'entrada' || t.type === 'recebimento' ? '+' : '-'}R$ {t.amount.toFixed(2)}
                        </span>
                        <button onClick={() => deleteTransaction(t.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">📊 Orçamento Mensal por Categoria</h3>
              <p className="text-sm text-gray-400 mb-4">Defina a meta de cada categoria e compare com o gasto real do mês.</p>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {budgetWithSpent.map((b, i) => (
                  <div key={b.name} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{b.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">Gasto: <span className={`font-semibold ${b.spent > b.limit && b.limit > 0 ? 'text-red-400' : 'text-emerald-400'}`}>R$ {b.spent.toFixed(2)}</span></span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">Meta:</span>
                          <input
                            type="number"
                            value={b.limit || ''}
                            onChange={(e) => updateBudgetLimit(i, parseFloat(e.target.value) || 0)}
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white w-24 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          b.limit > 0 && b.spent > b.limit ? 'bg-red-500' :
                          b.limit > 0 && b.spent > b.limit * 0.8 ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: b.limit > 0 ? `${Math.min((b.spent / b.limit) * 100, 100)}%` : '0%' }}
                      />
                    </div>
                    {b.limit > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {b.spent > b.limit ? `Excedeu em R$ ${(b.spent - b.limit).toFixed(2)}` : `Restam R$ ${(b.limit - b.spent).toFixed(2)}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">📜 Histórico Completo de Transações</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Nenhuma transação registrada</p>
                ) : (
                  [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          t.type === 'entrada' || t.type === 'recebimento' ? 'bg-emerald-500/20' :
                          t.type === 'investimento' ? 'bg-blue-500/20' : 'bg-red-500/20'
                        }`}>
                          {t.type === 'entrada' || t.type === 'recebimento' ? <ArrowUpCircle className="w-4 h-4 text-emerald-400" /> :
                           t.type === 'investimento' ? <Building2 className="w-4 h-4 text-blue-400" /> :
                           <ArrowDownCircle className="w-4 h-4 text-red-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t.description}</p>
                          <p className="text-xs text-gray-400">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')} • {t.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${
                          t.type === 'entrada' || t.type === 'recebimento' ? 'text-emerald-400' :
                          t.type === 'investimento' ? 'text-blue-400' : 'text-red-400'
                        }`}>
                          R$ {t.amount.toFixed(2)}
                        </span>
                        <button onClick={() => deleteTransaction(t.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Investments Tab */}
        {activeTab === 'investments' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">📈 Investimentos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Total Investido</p>
                  <p className="text-xl font-bold text-blue-400">R$ {totalInvestments.toFixed(2)}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Poupança Atual</p>
                  <p className="text-xl font-bold text-purple-400">R$ {savingsCurrent.toFixed(2)}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Meta de Poupança</p>
                  <p className="text-xl font-bold text-emerald-400">R$ {savingsGoal.toFixed(2)}</p>
                </div>
              </div>

              <h4 className="font-medium mb-3">Transações de Investimento</h4>
              <div className="space-y-2">
                {transactions.filter(t => t.type === 'investimento').length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Nenhum investimento registrado</p>
                ) : (
                  transactions.filter(t => t.type === 'investimento').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium">{t.description}</p>
                        <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <span className="text-blue-400 font-semibold">R$ {t.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Year Comparison Chart */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">📊 Evolução do Saldo Mensal</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="saldo" stroke="#10b981" strokeWidth={2} name="Saldo" dot={{ fill: '#10b981' }} />
                  <Line type="monotone" dataKey="entradas" stroke="#3b82f6" strokeWidth={2} name="Entradas" dot={{ fill: '#3b82f6' }} />
                  <Line type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={2} name="Saídas" dot={{ fill: '#ef4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/50 border-t border-gray-700 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            Desenvolvido por <span className="text-emerald-400 font-semibold">@matheusfigueiredosouza</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">MFfinanceiro © {currentYear} - Todos os direitos reservados</p>
          <p className="text-gray-600 text-xs mt-2">🔒 Seus dados são 100% privados e protegidos por senha pessoal</p>
        </div>
      </footer>
    </div>
  );
}
