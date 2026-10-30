export interface Transaction {
  id: string;
  type: 'entrada' | 'saida' | 'investimento' | 'pagamento' | 'recebimento';
  category: string;
  description: string;
  amount: number;
  date: string;
  isFixed: boolean;
  isInstallment: boolean;
  futureDate?: string;
}

export interface BudgetCategory {
  name: string;
  limit: number;
  spent: number;
}

export interface UserData {
  username: string;
  password: string;
  transactions: Transaction[];
  budget: BudgetCategory[];
  savingsGoal: number;
  savingsCurrent: number;
  monthlyIncome: number;
}

export const CATEGORIES = [
  'Moradia',
  'Alimentação',
  'Lanches',
  'Transporte',
  'Lazer',
  'Saúde',
  'Psicólogo',
  'Viagem',
  'Roupas',
  'Presentes',
  'Assinaturas',
  'Educação',
  'Compras',
  'Imprevistos',
  'Cuidados Pessoais',
  'Investimento Pessoal',
  'Projetos',
  'Negócios',
  'Impostos',
  'Fraude/Roubos',
  'Jogos e Apostas',
  'Dívidas',
  'Investimento',
  'Outros',
];
