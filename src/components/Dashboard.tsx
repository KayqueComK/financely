/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Plus,
  Trash2,
  LogOut,
  Calendar,
  Tag,
  ListFilter,
  Loader2,
  PieChart as PieIcon,
  Code2,
  Cpu,
  Server,
  Zap,
  GitMerge,
  Database,
  Terminal,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  Menu,
  Users,
  Shield,
  FileText,
  Pencil,
  TrendingUp
} from "lucide-react";
import { jsPDF } from "jspdf";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";

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


  const [sidebarHidden, setSidebarHidden] = useState(true);

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarHidden(false);
    }
  }, []);
  const [activeTab, setActiveTab] = useState<"dashboard" | "admin" | "market">("dashboard");
  const [marketQuery, setMarketQuery] = useState("");
  const [marketData, setMarketData] = useState<any[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("financely_watchlist");
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        // Remove crypto from old saves as free tier doesn't support it
        if (parsed.includes("BTC-BRL") || parsed.includes("BTCBRL")) {
          parsed = parsed.filter((s: string) => s !== "BTC-BRL" && s !== "BTCBRL");
          localStorage.setItem("financely_watchlist", JSON.stringify(parsed));
        }
        setWatchlist(parsed);
      } catch (e) {
        setWatchlist(["PETR4", "VALE3", "ITUB4", "BBAS3"]);
      }
    } else {
      setWatchlist(["PETR4", "VALE3", "ITUB4", "BBAS3"]);
    }
  }, []);

  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem("financely_watchlist", JSON.stringify(watchlist));
    }
  }, [watchlist]);

  const handleSearchMarket = async () => {
    if (!marketQuery) return;
    const query = marketQuery.trim().toUpperCase();
    setMarketLoading(true);
    try {
      const res = await fetch(`/api/market?tickers=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setWatchlist(prev => {
            const updated = [...prev];
            data.results.forEach((r: any) => {
              if (!updated.includes(r.symbol)) updated.push(r.symbol);
            });
            return updated;
          });
          setMarketQuery("");
        } else {
          alert("Nenhum ativo encontrado com esse código.");
        }
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao buscar dados do mercado.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão.");
    } finally {
      setMarketLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "market" && watchlist.length > 0) {
      const fetchWatchlist = async () => {
        setMarketLoading(true);
        try {
          const promises = watchlist.map(ticker =>
            fetch(`/api/market?tickers=${encodeURIComponent(ticker)}`).then(res => {
              if (!res.ok) throw new Error("Erro na requisição");
              return res.json();
            })
          );

          const results = await Promise.allSettled(promises);
          const combinedData: any[] = [];

          results.forEach(result => {
            if (result.status === "fulfilled" && result.value.results) {
              combinedData.push(result.value.results[0]);
            }
          });

          setMarketData(combinedData);
        } catch (e) {
          console.error(e);
        } finally {
          setMarketLoading(false);
        }
      };
      fetchWatchlist();
    }
  }, [activeTab, watchlist]);

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
    setMarketData(prev => prev.filter(a => a.symbol !== symbol));
  };

  const [selectedAssetChart, setSelectedAssetChart] = useState<any | null>(null);
  const [chartRange, setChartRange] = useState<"1d" | "5d" | "1mo">("1d");
  const [marketChartData, setMarketChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    if (selectedAssetChart) {
      const fetchChart = async () => {
        setChartLoading(true);
        try {
          let interval = "5m";
          if (chartRange === "5d") interval = "15m";
          if (chartRange === "1mo") interval = "1d";

          const res = await fetch(`/api/market?tickers=${selectedAssetChart.symbol}&range=${chartRange}&interval=${interval}`);
          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0 && data.results[0].historicalDataPrice) {
              const formatted = data.results[0].historicalDataPrice.map((d: any) => ({
                date: chartRange === "1d"
                  ? new Date(d.date * 1000).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })
                  : new Date(d.date * 1000).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' }),
                price: d.close
              }));
              setMarketChartData(formatted);
            } else {
              setMarketChartData([]);
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setChartLoading(false);
        }
      };
      fetchChart();
    }
  }, [selectedAssetChart, chartRange]);

  const [selectedCurrencyChart, setSelectedCurrencyChart] = useState<string | null>(null);
  const [currencyChartRange, setCurrencyChartRange] = useState<"1d" | "1w" | "1m" | "1y">("1d");
  const [currencyChartData, setCurrencyChartData] = useState<any[]>([]);
  const [currencyChartLoading, setCurrencyChartLoading] = useState(false);

  useEffect(() => {
    if (selectedCurrencyChart) {
      const fetchCurrencyChart = async () => {
        setCurrencyChartLoading(true);
        try {
          let url = "";
          switch (currencyChartRange) {
            case "1d":
              url = `https://economia.awesomeapi.com.br/json/${selectedCurrencyChart}/100`;
              break;
            case "1w":
              url = `https://economia.awesomeapi.com.br/json/daily/${selectedCurrencyChart}/7`;
              break;
            case "1m":
              url = `https://economia.awesomeapi.com.br/json/daily/${selectedCurrencyChart}/30`;
              break;
            case "1y":
              url = `https://economia.awesomeapi.com.br/json/daily/${selectedCurrencyChart}/360`;
              break;
            default:
              url = `https://economia.awesomeapi.com.br/json/${selectedCurrencyChart}/100`;
          }

          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();

            const reversedData = Array.isArray(data) ? [...data].reverse() : [];
            const formatted = reversedData.map((d: any) => ({
              date: currencyChartRange === "1d"
                ? new Date(parseInt(d.timestamp, 10) * 1000).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })
                : new Date(parseInt(d.timestamp, 10) * 1000).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' }),
              bid: parseFloat(d.bid)
            }));

            setCurrencyChartData(formatted);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setCurrencyChartLoading(false);
        }
      };
      fetchCurrencyChart();
    }
  }, [selectedCurrencyChart, currencyChartRange]);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<"summary" | "detailed">("detailed");
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState("");

  // Edit user fields
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("USER");
  const [editUserPassword, setEditUserPassword] = useState("");

  // Form states
  const [showAddTx, setShowAddTx] = useState(false);
  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState("EXPENSE");
  const [txCategory, setTxCategory] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txIsRecurring, setTxIsRecurring] = useState(false);

  // Edit transaction states
  const [showEditTx, setShowEditTx] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editTxDesc, setEditTxDesc] = useState("");
  const [editTxAmount, setEditTxAmount] = useState("");
  const [editTxType, setEditTxType] = useState("EXPENSE");
  const [editTxCategory, setEditTxCategory] = useState("");
  const [editTxDate, setEditTxDate] = useState("");

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

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Erro ao buscar usuários", e);
    }
  };

  useEffect(() => {
    if (activeTab === "admin") {
      fetchUsers();
    }
  }, [activeTab]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editUserName,
          email: editUserEmail,
          role: editUserRole,
          password: editUserPassword
        })
      });
      if (res.ok) {
        fetchUsers();
        setShowEditUserModal(false);
        setEditingUser(null);
        setEditUserPassword("");
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao atualizar usuário.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta de usuário permanentemente? Todos os seus dados serão apagados.")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao excluir usuário.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("Financely", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Sistema SaaS de Gestão Financeira", 14, 25);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 30);

    // Line separator
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(14, 35, 196, 35);

    // Document Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    const title = reportType === "detailed" ? "Relatório Financeiro Detalhado" : "Relatório Financeiro Simplificado (Resumo)";
    doc.text(title, 14, 45);

    // Metrics section
    doc.setFontSize(12);
    doc.text("Resumo Geral:", 14, 55);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Total de Receitas: ${formatValue(totalIncome)}`, 14, 63);
    doc.text(`Total de Despesas: ${formatValue(totalExpense)}`, 14, 69);

    const balanceColor = balance >= 0 ? [16, 185, 129] : [239, 68, 68]; // emerald vs rose
    doc.setFont("helvetica", "bold");
    doc.text("Saldo Líquido: ", 14, 75);
    doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
    doc.text(formatValue(balance), 42, 75);
    doc.setTextColor(15, 23, 42);

    doc.line(14, 82, 196, 82);

    if (reportType === "detailed") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Lista Detalhada de Lançamentos:", 14, 92);

      doc.setFontSize(9);
      // Table Header
      let y = 100;
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(14, y, 182, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text("Data", 16, y + 5);
      doc.text("Descrição", 38, y + 5);
      doc.text("Categoria", 95, y + 5);
      doc.text("Tipo", 135, y + 5);
      doc.text("Valor", 175, y + 5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      y += 7;

      transactions.forEach((tx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
          // Sub-header on new page
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 7, "F");
          doc.setFont("helvetica", "bold");
          doc.setTextColor(71, 85, 105);
          doc.text("Data", 16, y + 5);
          doc.text("Descrição", 38, y + 5);
          doc.text("Categoria", 95, y + 5);
          doc.text("Tipo", 135, y + 5);
          doc.text("Valor", 175, y + 5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(15, 23, 42);
          y += 7;
        }

        // Draw transaction row
        const dateStr = new Date(tx.date).toLocaleDateString("pt-BR");
        const descStr = tx.description.length > 30 ? tx.description.substring(0, 28) + "..." : tx.description;
        const catStr = tx.category?.name || "Sem Categoria";
        const typeStr = tx.type === "INCOME" ? "Receita" : "Despesa";
        const valStr = (tx.type === "INCOME" ? "+ " : "- ") + formatValue(tx.amount);

        doc.text(dateStr, 16, y + 5);
        doc.text(descStr, 38, y + 5);
        doc.text(catStr, 95, y + 5);

        if (tx.type === "INCOME") {
          doc.setTextColor(16, 185, 129); // emerald
        } else {
          doc.setTextColor(239, 68, 68); // rose
        }
        doc.text(typeStr, 135, y + 5);
        doc.text(valStr, 175, y + 5);

        doc.setTextColor(15, 23, 42); // reset

        // Draw light bottom border
        doc.setDrawColor(241, 245, 249);
        doc.line(14, y + 7, 196, y + 7);
        y += 7;
      });
    } else {
      // Summary mode: show categories table with totals
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Resumo de Gastos por Categoria:", 14, 92);

      let y = 100;
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Categoria", 16, y + 5);
      doc.text("Lançamentos", 100, y + 5);
      doc.text("Total Gasto", 150, y + 5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      y += 7;

      // Calculate totals per category for expenses
      const catSummary = transactions
        .filter(t => t.type === "EXPENSE")
        .reduce((acc: { [key: string]: { count: number; total: number } }, t) => {
          const name = t.category?.name || "Sem Categoria";
          if (!acc[name]) acc[name] = { count: 0, total: 0 };
          acc[name].count += 1;
          acc[name].total += t.amount;
          return acc;
        }, {});

      const summaryRows = Object.entries(catSummary);

      if (summaryRows.length === 0) {
        doc.text("Nenhuma despesa registrada para detalhar por categoria.", 16, y + 5);
      } else {
        summaryRows.forEach(([name, data]) => {
          doc.text(name, 16, y + 5);
          doc.text(data.count.toString(), 100, y + 5);
          doc.setTextColor(239, 68, 68); // Red color for expense totals
          doc.text(formatValue(data.total), 150, y + 5);
          doc.setTextColor(15, 23, 42); // reset

          doc.setDrawColor(241, 245, 249);
          doc.line(14, y + 7, 196, y + 7);
          y += 7;
        });
      }
    }

    doc.save(`relatorio-financeiro-${reportType}-${new Date().toISOString().split("T")[0]}.pdf`);
    setShowReportModal(false);
  };

  const fetchData = async () => {
    try {
      const [txRes, catRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/categories")
      ]);
      const txData = await txRes.json();
      const catData = await catRes.json();

      if (Array.isArray(txData)) {
        setTransactions(txData);
      } else {
        console.error("Failed to load transactions:", txData);
        setTransactions([]);
      }

      if (Array.isArray(catData)) {
        setCategories(catData);
        if (catData.length > 0) setTxCategory(catData[0].id);
      } else {
        console.error("Failed to load categories:", catData);
        setCategories([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRates = async () => {
    try {
      const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL");
      const data = await res.json();
      setUsdRate(parseFloat(data.USDBRL.bid));
      setEurRate(parseFloat(data.EURBRL.bid));
    } catch (e) {
      console.error("Erro ao carregar taxas de câmbio da AwesomeAPI", e);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const isSub = txIsRecurring;
      const res = await fetch(isSub ? "/api/subscriptions" : "/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: txDesc,
          amount: parseFloat(txAmount),
          type: txType,
          date: txDate,
          startDate: txDate, // API de assinatura usa startDate
          categoryId: txCategory
        })
      });
      if (res.ok) {
        if (isSub) {
          await fetchData(); // Força recarregamento para disparar geração de transação
        } else {
          const newTx = await res.json();
          setTransactions([newTx, ...transactions]);
        }
        setTxDesc("");
        setTxAmount("");
        setShowAddTx(false);
        setTxIsRecurring(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/transactions/${editingTx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editTxDesc,
          amount: parseFloat(editTxAmount),
          type: editTxType,
          date: editTxDate,
          categoryId: editTxCategory
        })
      });
      if (res.ok) {
        const updatedTx = await res.json();
        setTransactions(transactions.map(t => t.id === editingTx.id ? updatedTx : t));
        setShowEditTx(false);
        setEditingTx(null);
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao atualizar transação.");
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
    label: name,
    value: item.value,
    color: item.color
  }));

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-sky-600 mb-4" />
        <p className="text-slate-500 text-sm font-medium">Carregando dados do sistema...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-row min-h-screen bg-slate-50 text-slate-900 relative">

      {/* Mobile Backdrop */}
      {!sidebarHidden && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarHidden(true)}
        />
      )}

      {/* Sidebar Navigation - Navy Escura (Padrão ERP) */}
      <aside className={`fixed inset-y-0 left-0 z-50 md:relative md:sticky md:top-0 h-screen bg-slate-900 border-r border-slate-800 text-slate-200 shrink-0 transition-transform md:transition-[width,opacity] duration-300 ease-in-out select-none ${sidebarHidden ? "-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:border-r-0 md:pointer-events-none" : "translate-x-0 w-64 md:opacity-100"
        } overflow-hidden`}>
        <div className="w-64 h-full p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center justify-between gap-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white">Financely</h2>
                  <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider">Gestão Financeira</span>
                </div>
              </div>
              <button
                onClick={() => setSidebarHidden(true)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Ocultar Barra Lateral"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Usuário Logado</p>
              <h3 className="font-semibold text-white mt-0.5">{user?.name || "Usuário"}</h3>
              <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${user?.role === "ADMIN"
                ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                : "bg-sky-500/10 border border-sky-500/20 text-sky-400"
                }`}>
                {user?.role === "ADMIN" ? "Administrador" : "Acesso Total"}
              </span>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition text-left cursor-pointer ${activeTab === "dashboard"
                  ? "bg-sky-600/15 border border-sky-500/20 text-sky-400"
                  : "hover:bg-slate-800 text-slate-400 hover:text-white"
                  }`}
              >
                <Terminal className="w-4 h-4" /> Visão Geral
              </button>
              {user?.role === "ADMIN" && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition text-left cursor-pointer ${activeTab === "admin"
                    ? "bg-sky-600/15 border border-sky-500/20 text-sky-400"
                    : "hover:bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                >
                  <Users className="w-4 h-4" /> Painel Admin
                </button>
              )}
              <button
                onClick={() => setActiveTab("market")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition text-left cursor-pointer ${activeTab === "market"
                  ? "bg-sky-600/15 border border-sky-500/20 text-sky-400"
                  : "hover:bg-slate-800 text-slate-400 hover:text-white"
                  }`}
              >
                <TrendingUp className="w-4 h-4" /> Mercado & Cripto
              </button>
            </nav>
          </div>

          <button
            onClick={() => signOut()}
            className="mt-8 flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 font-medium text-sm transition text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area - Light Mode */}
      <main className="flex-1 p-4 md:p-8 w-full min-w-0 overflow-y-auto space-y-6 bg-slate-50">

        {/* Top Header Controls */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 select-none">
          <div className="flex items-center gap-3">
            {sidebarHidden && (
              <button
                onClick={() => setSidebarHidden(false)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-sm mr-2 flex items-center justify-center"
                title="Mostrar Barra Lateral"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {activeTab === "dashboard" ? "Visão Geral" : activeTab === "admin" ? "Painel Admin" : "Cotações do Mercado"}
              </h1>
              <p className="text-slate-500 text-sm">
                {activeTab === "dashboard"
                  ? "Painel corporativo de controle de despesas, receitas e fluxo."
                  : activeTab === "admin"
                    ? "Gerenciamento de usuários cadastrados e controle de acesso."
                    : "Consulte o valor de ações e criptomoedas em tempo real."}
              </p>
            </div>
          </div>

          {activeTab === "dashboard" && (
            <div className="flex items-center gap-3">
              {/* Currency Selector */}
              <div className="flex bg-slate-200 p-1 border border-slate-300 rounded-xl">
                {(["BRL", "USD", "EUR"] as const).map(curr => (
                  <button
                    key={curr}
                    onClick={() => {
                      setSelectedCurrency(curr);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${selectedCurrency === curr
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                      }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddTx(true)}
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm shadow-sky-600/10"
              >
                <Plus className="w-4 h-4" /> Nova Transação
              </button>
            </div>
          )}
        </header>

        {activeTab === "dashboard" && (
          <>
            {/* Financial Cards Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="erp-card p-6 rounded-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Saldo Total</span>
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 border border-sky-500/20 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900">{formatValue(balance)}</h2>
                <p className="text-[10px] text-slate-500 mt-2">Diferença líquida do caixa consolidado</p>
              </div>

              <div className="erp-card p-6 rounded-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Receitas</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold text-emerald-600">{formatValue(totalIncome)}</h2>
                <p className="text-[10px] text-slate-500 mt-2">Faturamento e entradas industriais</p>
              </div>

              <div className="erp-card p-6 rounded-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Despesas</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center">
                    <Server className="w-4 h-4" />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold text-rose-600">{formatValue(totalExpense)}</h2>
                <p className="text-[10px] text-slate-500 mt-2">Custos operacionais e despesas gerais</p>
              </div>
            </section>

            {/* Live currency rates ticker */}
            <section className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-wrap gap-6 items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-600" />
                <span className="font-semibold text-slate-700">Painel Integrador Cambial (AwesomeAPI):</span>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setSelectedCurrencyChart('USD-BRL')} className="hover:text-sky-600 transition cursor-pointer text-left">
                  Câmbio Dólar: <span className="font-bold text-slate-900">R$ {usdRate.toFixed(2)}</span>
                </button>
                <button onClick={() => setSelectedCurrencyChart('EUR-BRL')} className="hover:text-sky-600 transition cursor-pointer text-left">
                  Câmbio Euro: <span className="font-bold text-slate-900">R$ {eurRate.toFixed(2)}</span>
                </button>
              </div>
            </section>

            {/* Charts & Graphs Visual Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Main area graph */}
              <div className="lg:col-span-2 erp-card p-6 rounded-xl flex flex-col justify-between">
                <div className="mb-4">
                  <h3 className="font-bold text-sm tracking-tight text-slate-800 uppercase mb-1">Evolução do Fluxo de Caixa</h3>
                  <p className="text-xs text-slate-500">Apuração de saldo acumulado por período de lançamento.</p>
                </div>
                <div className="h-64 w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip
                          contentStyle={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#334155" }}
                          labelStyle={{ color: "#64748b", fontWeight: "bold" }}
                        />
                        <Area type="monotone" dataKey="valor" stroke="#0284c7" fillOpacity={1} fill="url(#colorValor)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      Lançamentos insuficientes para plotar evolução.
                    </div>
                  )}
                </div>
              </div>

              {/* Pie Chart */}
              <div className="erp-card p-6 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="mb-4 select-none pointer-events-none">
                    <h3 className="font-bold text-sm tracking-tight text-slate-800 uppercase mb-1">Centro de Custos / Categorias</h3>
                    <p className="text-xs text-slate-500">Distribuição percentual das despesas da organização.</p>
                  </div>
                  <div className="h-52 w-full flex items-center justify-center relative">
                    {pieData.length > 0 ? (
                      <div 
                        className="w-full h-full relative flex items-center justify-center"
                        onMouseMove={(e) => {
                          if (tooltipRef.current) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            tooltipRef.current.style.left = `${e.clientX - rect.left + 15}px`;
                            tooltipRef.current.style.top = `${e.clientY - rect.top + 15}px`;
                          }
                        }}
                      >
                        <PieChart
                          data={pieData}
                          innerRadius={85}
                          padAngle={0.05}
                          cornerRadius={4}
                          hoverOffset={10}
                          startAngle={-90 * Math.PI / 180}
                          endAngle={270 * Math.PI / 180}
                          enterTransition={{ type: "tween", duration: 1.1, ease: [0.85, 0, 0.15, 1] }}
                          enterStaggerScale={1.00}
                          hoveredIndex={hoveredSlice}
                          onHoverChange={setHoveredSlice}
                        >
                          {pieData.map((_, index) => (
                            <PieSlice key={index} index={index} hoverEffect="translate" />
                          ))}
                        </PieChart>
                        {hoveredSlice !== null && pieData[hoveredSlice] && (
                          <div 
                            ref={tooltipRef}
                            className="absolute pointer-events-none bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 z-50 flex flex-col items-center transition-opacity duration-150"
                            style={{ left: 0, top: 0 }}>
                            <span className="font-bold text-slate-800 text-xs mb-1">{pieData[hoveredSlice].label}</span>
                            <span className="text-slate-600 text-[10px] font-medium bg-slate-100 px-2 py-0.5 rounded-md">R$ {formatValue(pieData[hoveredSlice].value)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        Sem despesas lançadas no período.
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Legend at Bottom */}
                {pieData.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center text-[10px] font-bold text-slate-600 uppercase border-t border-slate-100 pt-3 select-none pointer-events-none">
                    {pieData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/65 px-2.5 py-1 rounded-lg">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.label}: {formatValue(item.value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </section>

            {/* Transactions Table / List */}
            <section className="erp-card p-6 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-base tracking-tight text-slate-900">Extrato de Lançamentos Recentes</h3>
                  <p className="text-xs text-slate-500">Transações consolidadas de entradas e saídas.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-2 bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-700 font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer shadow-sm"
                  >
                    <FileText className="w-4 h-4" /> Gerar PDF
                  </button>
                  <button
                    onClick={() => setShowAddCat(true)}
                    className="flex items-center gap-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer shadow-sm"
                  >
                    Nova Categoria
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 rounded-l-lg">Descrição</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Data</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4 text-right">Valor</th>
                      <th className="py-3 px-4 text-center rounded-r-lg">Ações</th>
                    </tr>
                  </thead>
                  <motion.tbody className="divide-y divide-slate-100" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>
                    {transactions.length > 0 ? (
                      transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50 transition">
                          <td className="py-4 px-4 font-semibold text-slate-800">{tx.description}</td>
                          <td className="py-4 px-4">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: `${tx.category.color}15`, color: tx.category.color }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.category.color }} />
                              {tx.category.name}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-500">
                            {new Date(tx.date).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-4 px-4 text-xs font-bold">
                            {tx.type === "INCOME" ? (
                              <span className="text-emerald-600">Receita</span>
                            ) : (
                              <span className="text-rose-600">Despesa</span>
                            )}
                          </td>
                          <td className={`py-4 px-4 text-right font-bold ${tx.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                            {tx.type === "INCOME" ? "+" : "-"} {formatValue(tx.amount)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingTx(tx);
                                  setEditTxDesc(tx.description);
                                  setEditTxAmount(tx.amount.toString());
                                  setEditTxType(tx.type);
                                  setEditTxCategory(tx.category.id);
                                  setEditTxDate(new Date(tx.date).toISOString().split("T")[0]);
                                  setShowEditTx(true);
                                }}
                                className="text-slate-400 hover:text-sky-600 p-1.5 rounded-lg hover:bg-sky-500/10 transition cursor-pointer"
                                title="Editar Transação"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                                title="Excluir Transação"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                          Nenhum lançamento no banco de dados. Adicione sua primeira transação!
                        </td>
                      </tr>
                    )}
                  </motion.tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === "admin" && (
          <section className="space-y-6 animate-in fade-in duration-200">
            {/* Search and Summary Card */}
            <div className="erp-card p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 max-w-md relative">
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou e-mail..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl erp-input text-sm text-slate-800"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Total de Usuários: <span className="text-slate-900 font-bold">{users.length}</span>
              </div>
            </div>

            {/* Users Table */}
            <div className="erp-card p-6 rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 font-medium">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 rounded-l-lg">Nome</th>
                      <th className="py-3 px-4">E-mail</th>
                      <th className="py-3 px-4">Role / Nível</th>
                      <th className="py-3 px-4 text-center rounded-r-lg">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.filter(u =>
                      (u.name || "").toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                      (u.email || "").toLowerCase().includes(searchUserQuery.toLowerCase())
                    ).map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="py-4 px-4 font-semibold text-slate-800">{u.name || "Sem Nome"}</td>
                        <td className="py-4 px-4 text-slate-600">{u.email}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${u.role === "ADMIN"
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-600"
                            : "bg-sky-500/10 border border-sky-500/20 text-sky-600"
                            }`}>
                            {u.role === "ADMIN" ? "Administrador" : "Usuário Comum"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setEditUserName(u.name || "");
                                setEditUserEmail(u.email);
                                setEditUserRole(u.role || "USER");
                                setEditUserPassword("");
                                setShowEditUserModal(true);
                              }}
                              className="text-sky-600 hover:text-sky-700 font-semibold text-xs px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 transition cursor-pointer"
                            >
                              Editar
                            </button>
                            {user?.email !== u.email && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-rose-600 hover:text-rose-700 font-semibold text-xs px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
                              >
                                Excluir
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === "market" && (
          <section className="space-y-6 animate-in fade-in duration-200">
            <div className="erp-card p-6 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Cotações da Bolsa e Cripto</h3>
                <p className="text-xs text-slate-500">Busque por ações (Ex: PETR4, ITUB4, MGLU3).</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="PETR4, MGLU3..."
                  className="w-full md:w-64 px-4 py-2.5 rounded-xl erp-input text-sm"
                  value={marketQuery}
                  onChange={(e) => setMarketQuery(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchMarket();
                  }}
                />
                <button
                  onClick={handleSearchMarket}
                  disabled={marketLoading}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center min-w-[100px]"
                >
                  {marketLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                </button>
              </div>
            </div>

            {marketData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketData.map((asset, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedAssetChart(asset)}
                    className="erp-card p-6 rounded-xl flex flex-col relative overflow-hidden select-none cursor-pointer hover:border-sky-500/50 transition border border-transparent caret-transparent"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {asset.logourl && (
                        <img src={asset.logourl} alt={asset.symbol} className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-slate-100" />
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 pointer-events-none">{asset.symbol}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-1 pointer-events-none">{asset.shortName || asset.longName || "Ativo"}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(asset.symbol);
                        }}
                        className="ml-auto text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Preço Atual</p>
                        <p className="text-2xl font-extrabold text-slate-900">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: asset.currency || 'BRL' }).format(asset.regularMarketPrice)}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-xs font-bold ${asset.regularMarketChangePercent >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {asset.regularMarketChangePercent > 0 ? "+" : ""}{asset.regularMarketChangePercent?.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>

      {/* Add Transaction Modal */}
      {showAddTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold mb-4 text-slate-900">Nova Transação</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nota Fiscal de Compra 120"
                  className="w-full px-4 py-3 rounded-xl erp-input text-sm"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valor (BRL)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl erp-input text-sm"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 rounded-xl erp-input text-sm"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl erp-input text-sm"
                    value={txType}
                    onChange={(e) => setTxType(e.target.value)}
                  >
                    <option value="EXPENSE">Despesa</option>
                    <option value="INCOME">Receita</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Categoria</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl erp-input text-sm"
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2 select-none">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                    checked={txIsRecurring}
                    onChange={(e) => setTxIsRecurring(e.target.checked)}
                  />
                  <label htmlFor="isRecurring" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                    É uma mensalidade?
                  </label>
                </div>
                {txIsRecurring && (
                  <div className="bg-sky-50 p-3 rounded-xl border border-sky-100 mt-2 select-none pointer-events-none">
                    <p className="text-xs text-sky-700 leading-relaxed">
                      <span className="font-bold"></span> O sistema vai registrar esse lançamento e <span className="underline">renovar automaticamente todo mês</span> na data selecionada acima. Você não precisará mais adicioná-la manualmente!
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddTx(false)}
                  className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition cursor-pointer select-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition cursor-pointer select-none"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gravar Lançamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditTx && editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold mb-4 text-slate-900">Editar Transação</h3>
            <form onSubmit={handleUpdateTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nota Fiscal de Compra 120"
                  className="w-full px-4 py-3 rounded-xl erp-input text-sm"
                  value={editTxDesc}
                  onChange={(e) => setEditTxDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valor (BRL)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl erp-input text-sm"
                    value={editTxAmount}
                    onChange={(e) => setEditTxAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 rounded-xl erp-input text-sm"
                    value={editTxDate}
                    onChange={(e) => setEditTxDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl erp-input text-sm font-semibold"
                    value={editTxType}
                    onChange={(e) => setEditTxType(e.target.value)}
                  >
                    <option value="EXPENSE">Despesa</option>
                    <option value="INCOME">Receita</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Categoria</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl erp-input text-sm font-semibold"
                    value={editTxCategory}
                    onChange={(e) => setEditTxCategory(e.target.value)}
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
                  onClick={() => {
                    setShowEditTx(false);
                    setEditingTx(null);
                  }}
                  className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold mb-4 text-slate-900">Nova Categoria</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Insumos de Produção"
                  className="w-full px-4 py-3 rounded-xl erp-input text-sm"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cor de Identificação</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="w-12 h-12 bg-transparent border-0 rounded-xl cursor-pointer"
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                  />
                  <span className="text-xs text-slate-500 font-mono">{catColor}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCat(false)}
                  className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gravar Categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold mb-4 text-slate-900">Editar Conta de Usuário</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do usuário"
                  className="w-full px-4 py-3 rounded-xl erp-input text-sm text-slate-850"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Endereço de E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@dominio.com"
                  className="w-full px-4 py-3 rounded-xl erp-input text-sm text-slate-850"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nível de Acesso (Role)</label>
                <select
                  className="w-full px-4 py-3 rounded-xl erp-input text-sm font-semibold text-slate-800"
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value)}
                >
                  <option value="USER">Usuário Comum</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nova Senha (deixe em branco para manter a atual)</label>
                <input
                  type="password"
                  placeholder="Digite uma nova senha se quiser alterar"
                  className="w-full px-4 py-3 rounded-xl erp-input text-sm text-slate-850"
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false);
                    setEditingUser(null);
                    setEditUserPassword("");
                  }}
                  className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold mb-2 text-slate-900">Exportar Relatório PDF</h3>
            <p className="text-xs text-slate-500 mb-6">Selecione o nível de detalhamento do relatório das transações consolidadas.</p>

            <div className="space-y-4">
              <button
                onClick={() => setReportType("detailed")}
                className={`w-full p-4 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${reportType === "detailed"
                  ? "bg-sky-50 border-sky-500 text-sky-900"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${reportType === "detailed" ? "border-sky-500 bg-sky-500" : "border-slate-300"
                  }`}>
                  {reportType === "detailed" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold">Relatório Detalhado</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Exibe receitas, despesas, data, descrição e valor de cada lançamento.</p>
                </div>
              </button>

              <button
                onClick={() => setReportType("summary")}
                className={`w-full p-4 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${reportType === "summary"
                  ? "bg-sky-50 border-sky-500 text-sky-900"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${reportType === "summary" ? "border-sky-500 bg-sky-500" : "border-slate-300"
                  }`}>
                  {reportType === "summary" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold">Relatório Simplificado</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mostra os totais acumulados de entradas e saídas e agrupamento por categoria.</p>
                </div>
              </button>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-3 px-4 text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleGeneratePDF}
                className="flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition cursor-pointer shadow-sm shadow-sky-600/10"
              >
                Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Chart Modal */}
      {selectedAssetChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" onClick={() => setSelectedAssetChart(null)}>
          <div className="w-full max-w-3xl bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                {selectedAssetChart.logourl && (
                  <img src={selectedAssetChart.logourl} alt={selectedAssetChart.symbol} className="w-12 h-12 rounded-lg object-contain bg-slate-50 p-1 border border-slate-100" />
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedAssetChart.symbol}</h3>
                  <p className="text-xs text-slate-500">{selectedAssetChart.shortName || selectedAssetChart.longName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAssetChart(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer">
                Fechar
              </button>
            </div>

            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-lg w-max">
              <button
                onClick={() => setChartRange("1d")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${chartRange === "1d" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >1 Dia</button>
              <button
                onClick={() => setChartRange("5d")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${chartRange === "5d" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >1 Semana</button>
              <button
                onClick={() => setChartRange("1mo")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${chartRange === "1mo" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >1 Mês</button>
            </div>

            <div className="h-72 w-full">
              {chartLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-2" />
                  <p className="text-xs text-slate-500">Buscando histórico...</p>
                </div>
              ) : marketChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketChartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedAssetChart.regularMarketChangePercent >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={selectedAssetChart.regularMarketChangePercent >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} dy={10} minTickGap={30} />
                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} dx={-10} tickFormatter={(val) => `R$ ${val.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Preço"]}
                      labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="price" stroke={selectedAssetChart.regularMarketChangePercent >= 0 ? "#10b981" : "#f43f5e"} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-500">Sem dados históricos para este período.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Currency Chart Modal */}
      {selectedCurrencyChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" onClick={() => setSelectedCurrencyChart(null)}>
          <div className="w-full max-w-3xl bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-sky-50 flex items-center justify-center border border-sky-100 text-sky-600">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedCurrencyChart === "USD-BRL" ? "Dólar Americano" : "Euro"}</h3>
                  <p className="text-xs text-slate-500">{selectedCurrencyChart}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCurrencyChart(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer">
                Fechar
              </button>
            </div>

            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-lg w-max">
              <button
                onClick={() => setCurrencyChartRange("1d")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${currencyChartRange === "1d" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >1 Dia</button>
              <button
                onClick={() => setCurrencyChartRange("1w")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${currencyChartRange === "1w" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >1 Semana</button>
              <button
                onClick={() => setCurrencyChartRange("1m")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${currencyChartRange === "1m" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >1 Mês</button>
              <button
                onClick={() => setCurrencyChartRange("1y")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${currencyChartRange === "1y" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >1 Ano</button>
            </div>

            <div className="h-72 w-full">
              {currencyChartLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-2" />
                  <p className="text-xs text-slate-500">Buscando histórico de câmbio...</p>
                </div>
              ) : currencyChartData.length > 0 ? (() => {
                const isPositive = currencyChartData[currencyChartData.length - 1].bid >= currencyChartData[0].bid;
                const color = isPositive ? "#10b981" : "#f43f5e";

                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currencyChartData}>
                      <defs>
                        <linearGradient id="colorCurrencyPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} dy={10} minTickGap={30} />
                      <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} dx={-10} tickFormatter={(val) => `R$ ${val.toFixed(2)}`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                        formatter={(value: number) => [`R$ ${value.toFixed(4)}`, "Câmbio"]}
                        labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                      />
                      <Area type="monotone" dataKey="bid" stroke={color} strokeWidth={3} fillOpacity={1} fill="url(#colorCurrencyPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                );
              })() : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <p className="text-slate-500 text-sm">Sem histórico disponível.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
