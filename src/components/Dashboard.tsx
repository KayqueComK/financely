"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  LogOut, 
  Crown, 
  Coins, 
  Sparkles, 
  Calendar, 
  Tag, 
  ListFilter,
  Loader2,
  PieChart as PieIcon,
  Activity
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Cell,
  Pie
} from "recharts";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
  category: Category;
}

export default function Dashboard() {
  const { data: session, update } = useSession();
  const user = session?.user as any;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [usdRate, setUsdRate] = useState<number>(0);
  const [eurRate, setEurRate] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<"BRL" | "USD" | "EUR">("BRL");

  // Form states
  const [showAddTx, setShowAddTx] = useState(false);
  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState("EXPENSE");
  const [txCategory, setTxCategory] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);

  const [showAddCat, setShowAddCat] = useState(false);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#3B82F6");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchData();
    fetchRates();
  }, []);

  const fetchData = async () => {
    try {
      const [txRes, catRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/categories")
      ]);
      const txData = await txRes.json();
      const catData = await catRes.json();
      setTransactions(txData);
      setCategories(catData);
      if (catData.length > 0) setTxCategory(catData[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/rates");
      const data = await res.json();
      setUsdRate(data.USDBRL);
      setEurRate(data.EURBRL);
    } catch (e) {
      console.error("Erro ao carregar taxas de câmbio", e);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: txDesc,
          amount: parseFloat(txAmount),
          type: txType,
          date: txDate,
          categoryId: txCategory
        })
      });
      if (res.ok) {
        const newTx = await res.json();
        setTransactions([newTx, ...transactions]);
        setTxDesc("");
        setTxAmount("");
        setShowAddTx(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catName, color: catColor })
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories([...categories, newCat]);
        setTxCategory(newCat.id);
        setCatName("");
        setShowAddCat(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTransactions(transactions.filter(t => t.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulatePremium = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/premium", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        // Update NextAuth Session Client-side
        await update({ isPremium: true });
        alert("Simulação de Assinatura Completa! Você agora é um usuário Premium ✨");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Currencies Conversion
  const convertAmount = (amount: number) => {
    if (selectedCurrency === "USD" && usdRate > 0) return amount / usdRate;
    if (selectedCurrency === "EUR" && eurRate > 0) return amount / eurRate;
    return amount;
  };

  const formatValue = (value: number) => {
    const converted = convertAmount(value);
    const formatter = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: selectedCurrency,
    });
    return formatter.format(converted);
  };

  // Recharts Chart Data Processing
  // Evolution of balance over time (last 7 transactions / dates)
  const chartData = [...transactions]
    .reverse()
    .slice(-10)
    .map(t => ({
      date: new Date(t.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      valor: t.type === "INCOME" ? t.amount : -t.amount,
      desc: t.description
    }));

  // Pie chart expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc: { [key: string]: { value: number; color: string } }, t) => {
      const name = t.category.name;
      const color = t.category.color || "#64748B";
      if (!acc[name]) acc[name] = { value: 0, color };
      acc[name].value += t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expensesByCategory).map(([name, item]) => ({
    name,
    value: item.value,
    color: item.color
  }));

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-400 text-sm">Carregando seus dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-950">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Financely</h2>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Dashboard SaaS</span>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-xs text-slate-400">Bem-vindo,</p>
            <h3 className="font-semibold text-slate-200">{user?.name || "Usuário"}</h3>
            {user?.isPremium ? (
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" /> Premium
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] bg-slate-800 border border-slate-700 text-slate-400 font-medium px-2 py-0.5 rounded-full">
                Membro Free
              </span>
            )}
          </div>

          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 font-medium text-sm transition">
              <Activity className="w-4 h-4" /> Visão Geral
            </button>
            
            {!user?.isPremium && (
              <button 
                onClick={handleSimulatePremium}
                disabled={actionLoading}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-medium text-sm transition cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4" /> Obter Premium
                </span>
                <Crown className="w-3 h-3 text-amber-400" />
              </button>
            )}
          </nav>
        </div>

        <button 
          onClick={() => signOut()}
          className="mt-8 flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 font-medium text-sm transition text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sair da conta
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
        
        {/* Top Header Controls */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
            <p className="text-slate-400 text-sm">Organize suas contas e controle a cotação de moedas.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Currency Selector (Stripe/Currency Feature Premium Highlight) */}
            <div className="flex bg-slate-900/80 p-1 border border-slate-800 rounded-xl">
              {(["BRL", "USD", "EUR"] as const).map(curr => (
                <button
                  key={curr}
                  onClick={() => {
                    if (curr !== "BRL" && !user?.isPremium) {
                      alert("A conversão de moedas (USD/EUR) é um recurso exclusivo Premium! Assine para desbloquear.");
                      return;
                    }
                    setSelectedCurrency(curr);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition cursor-pointer ${
                    selectedCurrency === curr 
                      ? "bg-indigo-600 text-white" 
                      : "text-slate-400 hover:text-slate-200"
                  } ${curr !== "BRL" && !user?.isPremium ? "opacity-40" : ""}`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddTx(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nova Transação
            </button>
          </div>
        </header>

        {/* Financial Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Saldo Total</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">{formatValue(balance)}</h2>
            <p className="text-[10px] text-indigo-400 mt-2">Diferença de receitas vs despesas</p>
          </div>

          <div className="glass p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Receitas</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-emerald-400">{formatValue(totalIncome)}</h2>
            <p className="text-[10px] text-emerald-500 mt-2">Entradas financeiras registradas</p>
          </div>

          <div className="glass p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Despesas</span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-rose-400">{formatValue(totalExpense)}</h2>
            <p className="text-[10px] text-rose-500 mt-2">Saídas financeiras registradas</p>
          </div>
        </section>

        {/* Live currency rates ticker */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-wrap gap-6 items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">Cotações em tempo real (AwesomeAPI):</span>
          </div>
          <div className="flex gap-4">
            <div>Dólar Comercial: <span className="font-semibold text-emerald-400">R$ {usdRate.toFixed(2)}</span></div>
            <div>Euro Comercial: <span className="font-semibold text-indigo-400">R$ {eurRate.toFixed(2)}</span></div>
          </div>
        </section>

        {/* Charts & Graphs Visual Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main area graph */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-bold text-sm tracking-tight text-slate-200 uppercase mb-1">Evolução do Fluxo de Caixa</h3>
              <p className="text-xs text-slate-400">Gráfico mostrando o impacto líquido das últimas transações.</p>
            </div>
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                      labelStyle={{ color: "#94a3b8" }}
                    />
                    <Area type="monotone" dataKey="valor" stroke="#6366f1" fillOpacity={1} fill="url(#colorValor)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Sem transações suficientes para gerar o gráfico.
                </div>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="glass p-6 rounded-2xl flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-bold text-sm tracking-tight text-slate-200 uppercase mb-1">Distribuição de Gastos</h3>
              <p className="text-xs text-slate-400">Percentual de despesas por categoria de transação.</p>
            </div>
            <div className="h-64 w-full flex items-center justify-center relative">
              {pieData.length > 0 ? (
                <div className="w-full h-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend inside absolute */}
                  <div className="absolute flex flex-col items-center">
                    <PieIcon className="w-5 h-5 text-indigo-400" />
                    <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Gastos</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Adicione despesas para ver o gráfico.
                </div>
              )}
            </div>
          </div>

        </section>

        {/* Transactions Table / List */}
        <section className="glass p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-base tracking-tight">Transações Recentes</h3>
              <p className="text-xs text-slate-400">Lista completa das suas movimentações de entrada e saída.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAddCat(true)}
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs px-3 py-2 rounded-xl transition cursor-pointer"
              >
                Nova Categoria
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center rounded-r-lg">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {transactions.length > 0 ? (
                  transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-900/30 transition">
                      <td className="py-4 px-4 font-semibold text-slate-200">{tx.description}</td>
                      <td className="py-4 px-4">
                        <span 
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${tx.category.color}15`, color: tx.category.color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.category.color }} />
                          {tx.category.name}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {new Date(tx.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold">
                        {tx.type === "INCOME" ? (
                          <span className="text-emerald-400">Receita</span>
                        ) : (
                          <span className="text-rose-400">Despesa</span>
                        )}
                      </td>
                      <td className={`py-4 px-4 text-right font-bold ${tx.type === "INCOME" ? "text-emerald-400" : "text-rose-400"}`}>
                        {tx.type === "INCOME" ? "+" : "-"} {formatValue(tx.amount)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      Nenhuma transação encontrada. Comece adicionando uma acima!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* Add Transaction Modal */}
      {showAddTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass p-6 rounded-2xl relative">
            <h3 className="text-lg font-bold mb-4">Nova Transação</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Supermercado"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Valor (BRL)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Data</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Tipo</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    value={txType}
                    onChange={(e) => setTxType(e.target.value)}
                  >
                    <option value="EXPENSE">Despesa</option>
                    <option value="INCOME">Receita</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Categoria</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddTx(false)}
                  className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm glass p-6 rounded-2xl relative">
            <h3 className="text-lg font-bold mb-4">Nova Categoria</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Educação"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Cor para Gráficos</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="w-12 h-12 bg-transparent border-0 rounded-xl cursor-pointer"
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                  />
                  <span className="text-xs text-slate-400 font-mono">{catColor}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCat(false)}
                  className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
