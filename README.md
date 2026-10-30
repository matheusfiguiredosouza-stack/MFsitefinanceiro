# MFfinanceiro - Sistema de Controle Financeiro Pessoal

Sistema completo de controle financeiro pessoal com assistente inteligente, gráficos comparativos e segurança total dos dados.

## 🎯 Funcionalidades

### 1. **Sistema de Login Seguro**
- Cada usuário cria sua própria conta com senha
- Dados 100% privados - nem o administrador tem acesso
- Salvamento automático em localStorage

### 2. **Painel Principal (Dashboard)**
- Resumo de entradas, saídas, saldo e poupança
- Gráficos comparativos mensais (entradas vs saídas)
- Gráfico de gastos por categoria (pizza)
- Meta de poupança com barra de progresso
- Anel de gastos semanal (verde/vermelho/cinza)

### 3. **Controle de Transações**
- Registro de entradas, saídas, investimentos, pagamentos e recebimentos futuros
- Categorização completa (24 categorias em português)
- Marcação de gastos fixos e parcelas
- Histórico completo com filtro por mês

### 4. **Orçamento por Categoria**
- 24 categorias organizadas:
  - Moradia, Alimentação, Lanches, Transporte, Lazer
  - Saúde, Psicólogo, Viagem, Roupas, Presentes
  - Assinaturas, Educação, Compras, Imprevistos
  - Cuidados Pessoais, Investimento Pessoal, Projetos
  - Negócios, Impostos, Fraude/Roubos, Jogos e Apostas
  - Dívidas, Investimento, Outros
- Definição de metas para cada categoria
- Barra de progresso comparando gasto vs limite
- Alertas visuais (verde/amarelo/vermelho)

### 5. **Assistente Financeiro Inteligente (Boneco 3D)**
Avatar 3D com óculos, cabelo cacheado castanho e barba fechada que:
- **Analisa o histórico completo** de transações
- **Prioriza pagamentos** por urgência e juros
- **Dá dicas personalizadas** baseadas no seu perfil
- **Cria plano de ação semanal** para aliviar a folha
- **Sugere estratégias** de investimento gradual
- **Alerta sobre dívidas** e como quitá-las

#### Seções do Assistente:
1. **Prioridades**: Ordem recomendada de pagamento (crítico/alto/médio/baixo)
2. **Dicas**: Recomendações personalizadas baseadas nos seus dados
3. **Plano Semanal**: Pagamentos da semana e estratégia de alívio

### 6. **Histórico Completo**
- Todas as transações organizadas por data
- Filtro por tipo (entrada/saída/investimento)
- Visualização de categorias e valores

### 7. **Investimentos**
- Controle de valores investidos
- Evolução do saldo mensal (gráfico de linha)
- Comparativo de entradas vs saídas vs saldo

### 8. **Backup e Restauração**
- Exportação de dados em JSON
- Importação de backup em outro dispositivo
- Indicador de último salvamento
- Sincronização manual
- Zona de perigo (apagar todos os dados)

## 💾 Salvamento de Dados

### Como funciona:
1. **Salvamento Automático**: Todos os dados são salvos automaticamente no localStorage do navegador
2. **Persistência**: Ao sair e voltar, todos os dados estão lá
3. **Multi-dispositivo**: Use a função "Exportar Dados" para transferir entre dispositivos
4. **Privacidade**: Dados criptografados por senha pessoal

### Para usar em outro dispositivo:
1. No dispositivo original: Vá em "Dados & Backup" → "Exportar Dados"
2. Baixe o arquivo JSON
3. No novo dispositivo: Faça login com a mesma conta
4. Vá em "Dados & Backup" → "Importar Dados"
5. Selecione o arquivo JSON baixado
6. Pronto! Seus dados estarão sincronizados

## 🎨 Design

- **Tema Escuro**: Interface moderna e confortável para os olhos
- **Responsivo**: Funciona em desktop, tablet e celular
- **Cores Semânticas**:
  - 🟢 Verde: Entradas, dentro do orçamento, sucesso
  - 🔴 Vermelho: Saídas, estourou orçamento, crítico
  - 🔵 Azul: Investimentos, informações
  - 🟡 Amarelo: Atenção, próximo do limite
  - ⚫ Cinza: Sem gasto, dia futuro

## 🚀 Como Publicar o Site

### Opção 1: Vercel (Recomendado - Grátis)
1. Crie uma conta em [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Deploy automático a cada push
4. Domínio grátis: `seu-projeto.vercel.app`

### Opção 2: Netlify (Grátis)
1. Crie uma conta em [netlify.com](https://netlify.com)
2. Arraste a pasta `dist` para o Netlify
3. Site publicado instantaneamente
4. Domínio grátis: `seu-projeto.netlify.app`

### Opção 3: GitHub Pages (Grátis)
1. Crie um repositório no GitHub
2. Faça push do código
3. Ative GitHub Pages nas configurações
4. Domínio grátis: `seu-usuario.github.io/seu-repo`

### Opção 4: Domínio Próprio
1. Compre um domínio (ex: `mffinanceiro.com.br`)
2. Use qualquer serviço de hospedagem (Vercel, Netlify, etc)
3. Configure o DNS para apontar para o hosting
4. Site acessível pelo seu domínio personalizado

## 📱 Como Usar

### Primeiro Acesso:
1. Acesse o site
2. Clique em "Não tem conta? Cadastre-se"
3. Crie seu usuário e senha
4. Faça login

### Configurando o Sistema:
1. **Renda Mensal**: No Painel, digite sua renda mensal
2. **Orçamento**: Na aba "Orçamento", defina metas para cada categoria
3. **Meta de Poupança**: No Painel, defina quanto quer juntar

### Registrando Transações:
1. Vá na aba "Transações"
2. Escolha o tipo (entrada/saída/investimento/pagamento/recebimento)
3. Selecione a categoria
4. Preencha descrição, valor e data
5. Marque se é fixo ou parcela (se aplicável)
6. Clique em "Adicionar"

### Usando o Assistente:
1. No Painel, clique no Assistente (boneco 3D)
2. Veja as prioridades de pagamento
3. Leia as dicas personalizadas
4. Consulte o plano semanal

### Fazendo Backup:
1. Vá na aba "Dados & Backup"
2. Clique em "Exportar Dados"
3. Salve o arquivo JSON em local seguro
4. Para restaurar: clique em "Importar Dados" e selecione o arquivo

## 🔒 Segurança

- Senha pessoal para cada usuário
- Dados salvos localmente no navegador
- Nenhum acesso externo aos dados
- Nem o administrador do sistema pode ver seus dados
- Faça backup regularmente para não perder informações

## 📊 Categorias Completas

1. Moradia
2. Alimentação
3. Lanches
4. Transporte
5. Lazer
6. Saúde
7. Psicólogo
8. Viagem
9. Roupas
10. Presentes
11. Assinaturas
12. Educação
13. Compras
14. Imprevistos
15. Cuidados Pessoais
16. Investimento Pessoal
17. Projetos
18. Negócios
19. Impostos
20. Fraude/Roubos
21. Jogos e Apostas
22. Dívidas
23. Investimento
24. Outros

## 🛠️ Tecnologias Utilizadas

- **React 18**: Framework JavaScript
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Recharts**: Gráficos interativos
- **Lucide React**: Ícones
- **Vite**: Build tool

## 👨‍💻 Desenvolvido por

**@matheusfigueiredosouza**

## 📄 Licença

Todos os direitos reservados © 2024

---

**Dica**: Para melhor experiência, use o site no modo escuro do sistema operacional e mantenha o backup atualizado!
