"use client";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import MobileHeader from "../components/MobileHeader";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AppSidebar from "../components/AppSidebar";
import BookFormModal from "../components/BookFormModal";
import BookTable from "../components/BookTable";
import LevelBar from "../components/LevelBar";
import { API_URL } from "@/lib/api";

interface Profile {
  name: string;
  email: string;
  xp: number;
  level: number;
  xpToNext: number;
  xpProgress: number;
  totalBooks: number;
  booksRead: number;
  booksReading: number;
}

interface Book {
  _id: string;
  title: string;
  author: string;
  status: string;
  genre?: string;
  rating?: number | null;
  isReread?: boolean;
  createdAt?: string;
}

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!t) return router.replace("/login");
    setToken(t);
    setUser(JSON.parse(u!));
  }, [router]);

  const loadData = useCallback(async () => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    const [profileRes, booksRes] = await Promise.all([
      fetch(`${API_URL}/api/profile`, { headers }),
      fetch(`${API_URL}/api/books`, { headers }),
    ]);

    if (profileRes.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return router.replace("/login");
    }

    setProfile(await profileRes.json());
    setBooks(await booksRes.json());
  }, [token, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!token || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar userName={user?.name ?? ""} />
      <SidebarInset>
        <MobileHeader />
        <main className="max-w-6xl mx-auto space-y-6 px-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <LevelBar profile={profile} />

          <BookFormModal
            open={showForm}
            onOpenChange={setShowForm}
            token={token}
            onBookAdded={loadData}
          />

          <BookFormModal
            open={!!editingBook}
            onOpenChange={(open) => !open && setEditingBook(null)}
            token={token}
            onBookAdded={loadData}
            editBook={editingBook}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-xl font-mono">
                Meus livros ({books.length})
              </h2>
              <Button
                size="icon"
                onClick={() => setShowForm(true)}
                className="rounded-full bg-pink-400 hover:bg-pink-400/80"
                title="Adicionar livro"
              >
                <PlusIcon className="w-5 h-5" />
              </Button>
            </div>
            {books.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Nenhum livro cadastrado ainda.
              </p>
            ) : (
              <BookTable books={books} token={token} onUpdate={loadData} onEdit={setEditingBook} />
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
