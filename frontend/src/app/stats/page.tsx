"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";

interface Stats {
  totalBooks: number;
  booksRead: number;
  booksReading: number;
  booksWantToRead: number;
  averageRating: number;
  topGenres: { genre: string; count: number }[];
  monthlyReads: { month: string; count: number }[];
  totalRereads: number;
}

function formatMonth(month: string) {
  const [year, m] = month.split("-");
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return `${months[parseInt(m) - 1]} ${year}`;
}

export default function StatsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!t) return router.replace("/login");
    setToken(t);
    setUser(JSON.parse(u!));
  }, [router]);

  const loadStats = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return router.replace("/login");
    }
    setStats(await res.json());
  }, [token, router]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (!token || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  const topGenre = stats.topGenres[0];
  const topMonth = stats.monthlyReads.reduce(
    (best, m) => (m.count > best.count ? m : best),
    { month: "", count: 0 },
  );
  const maxMonthCount = Math.max(...stats.monthlyReads.map((m) => m.count), 1);
  const maxGenreCount = Math.max(...stats.topGenres.map((g) => g.count), 1);

  return (
    <div className="min-h-screen">
      <Navbar userName={user?.name ?? ""} />
      <main className="max-w-6xl mx-auto space-y-6 mt-4 px-4 pb-8">
        <h1 className="text-2xl font-bold font-mono">Estatisticas</h1>

        {/* Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total de livros" value={stats.totalBooks} />
          <StatCard
            label="Lidos"
            value={stats.booksRead}
            color="text-green-400"
          />
          <StatCard
            label="Lendo"
            value={stats.booksReading}
            color="text-blue-400"
          />
          <StatCard
            label="Quero ler"
            value={stats.booksWantToRead}
            color="text-yellow-400"
          />
        </div>

        {/* Destaques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gray-900 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Nota media</p>
            <p className="text-3xl font-bold font-mono mt-1">
              {stats.averageRating > 0 ? `${stats.averageRating}/10` : "—"}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Genero mais lido</p>
            <p className="text-3xl font-bold font-mono mt-1 text-pink-400">
              {topGenre ? topGenre.genre : "—"}
            </p>
            {topGenre && (
              <p className="text-gray-500 text-xs mt-1">
                {topGenre.count} {topGenre.count === 1 ? "livro" : "livros"}
              </p>
            )}
          </div>
          <div className="bg-gray-900 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Mes mais lido</p>
            <p className="text-3xl font-bold font-mono mt-1 text-pink-400">
              {topMonth.month ? formatMonth(topMonth.month) : "—"}
            </p>
            {topMonth.count > 0 && (
              <p className="text-gray-500 text-xs mt-1">
                {topMonth.count} {topMonth.count === 1 ? "livro" : "livros"}
              </p>
            )}
          </div>
        </div>

        {/* Releituras */}
        <div className="bg-gray-900 rounded-xl p-5 inline-block">
          <p className="text-gray-400 text-sm">Releituras</p>
          <p className="text-3xl font-bold font-mono mt-1">
            {stats.totalRereads}
          </p>
        </div>

        {/* Gêneros e Meses lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Top gêneros */}
          <div className="bg-gray-900 rounded-xl p-5 space-y-3">
            <p className="text-gray-400 text-sm font-medium">
              Livros lidos por genero
            </p>
            {stats.topGenres.length === 0 && (
              <p className="text-gray-500 text-sm">Nenhum livro lido ainda.</p>
            )}
            {stats.topGenres.map((g) => (
              <div key={g.genre} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{g.genre}</span>
                  <span className="text-gray-400">{g.count}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-pink-400 h-2 rounded-full transition-all"
                    style={{ width: `${(g.count / maxGenreCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Leituras por mês */}
          <div className="bg-gray-900 rounded-xl p-5 space-y-3">
            <p className="text-gray-400 text-sm font-medium">
              Livros lidos por mes
            </p>
            {stats.monthlyReads.length === 0 && (
              <p className="text-gray-500 text-sm">Nenhum livro lido ainda.</p>
            )}
            {stats.monthlyReads.map((m) => (
              <div key={m.month} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{formatMonth(m.month)}</span>
                  <span className="text-gray-400">{m.count}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-pink-400 h-2 rounded-full transition-all"
                    style={{ width: `${(m.count / maxMonthCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className={`text-2xl font-bold font-mono mt-1 ${color}`}>{value}</p>
    </div>
  );
}
