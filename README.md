# Financely 🪙 - SaaS de Gestão Financeira Pessoal

O **Financely** é uma plataforma SaaS moderna e completa para gestão financeira pessoal. Ela foi projetada com foco em experiência do usuário premium, utilizando Glassmorphic design, animações interativas e gráficos responsivos.

Este projeto foi construído para servir como um **portfólio de alto nível técnico**, destacando boas práticas de engenharia de software, modelagem de dados real e integrações modernas.

---

## 🚀 Demonstração Visual & Funcionalidades

- **Autenticação Segura:** Sistema completo de login e cadastro com criptografia de senhas (bcrypt) e controle de sessão gerenciado pelo **NextAuth (Auth.js)**.
- **Banco de Dados Relacional:** Modelagem de entidades reais (Usuário, Transação e Categoria) persistidas em um banco relacional gerenciado via **Prisma ORM**.
- **Painel Visual Interativo:** Resumos financeiros (Saldo, Receitas e Despesas) e gráficos dinâmicos usando **Recharts** (evolução de fluxo de caixa em gráfico de Área e distribuição por categoria em gráfico de Pizza).
- **Consumo de APIs de Cotação:** Integração ao vivo com a **AwesomeAPI** mostrando taxas de Dólar e Euro atualizadas em tempo real.
- **Assinatura Premium (Simulada):** Simulação de um checkout de pagamento no estilo Stripe que atualiza dinamicamente as permissões do usuário (desbloqueando conversão de moedas e recursos exclusivos do dashboard).

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js (App Router)](https://nextjs.org/) + TypeScript
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) (com classes personalizadas de blur/glassmorphism)
- **Segurança & Sessão:** [NextAuth.js (v4)](https://next-auth.js.org/) & [BcryptJS](https://github.com/dcodeIO/bcrypt.js)
- **Banco de Dados:** SQLite (com o novo driver nativo `@prisma/adapter-better-sqlite3` necessário no Prisma 7)
- **Banco ORM:** [Prisma ORM (v7)](https://www.prisma.io/)
- **Visualização de Dados:** [Recharts](https://recharts.org/)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 📦 Como Instalar e Executar Localmente

### Pré-requisitos
- Node.js (v18 ou superior)
- npm (ou pnpm/yarn/bun)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone <link-do-seu-repositorio>
   cd financely
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto (o arquivo já possui valores padrão seguros para testes locais):
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="bf0b5c163459c3629e46a7828d15a9de"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Prepare o Banco de Dados:**
   Execute as migrações do Prisma para criar as tabelas locais no banco SQLite:
   ```bash
   npx prisma migrate dev
   ```

5. **Inicie o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🐳 Executando com Docker

Se preferir rodar a aplicação em um container Docker isolado, você pode fazer isso em dois passos:

1. **Construir a Imagem:**
   ```bash
   docker build -t financely .
   ```

2. **Rodar o Container:**
   ```bash
   docker run -p 3000:3000 --env-file .env financely
   ```
   A aplicação estará disponível na porta `3000` apontando para o seu banco de dados local configurado.
