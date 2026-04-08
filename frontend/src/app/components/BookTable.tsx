"use client";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/lib/api";
import { GENRE_OPTIONS, status, STATUS_LABELS } from "@/lib/constants";
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

interface Book {
  _id: string;
  title: string;
  author: string;
  status: string;
  genre?: string;
  rating?: number | null;
  isReread?: boolean;
  createdAt?: string;
  finishedAt?: string | null;
}

interface BookTableProps {
  books: Book[];
  token: string;
  onUpdate: () => void;
  onEdit: (book: Book) => void;
}

export default function BookTable({
  books,
  token,
  onUpdate,
  onEdit,
}: BookTableProps) {
  const [filterTitle, setFilterTitle] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterDateRange, setFilterDateRange] = useState<DateRange | undefined>(
    undefined,
  );

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      if (
        filterTitle &&
        !book.title.toLowerCase().includes(filterTitle.toLowerCase())
      )
        return false;
      if (
        filterAuthor &&
        !book.author.toLowerCase().includes(filterAuthor.toLowerCase())
      )
        return false;
      if (
        filterGenre &&
        !(book.genre || "").toLowerCase().includes(filterGenre.toLowerCase())
      )
        return false;
      if (filterStatus !== status.TODOS && book.status !== filterStatus)
        return false;
      if (filterDateRange?.from && book.createdAt) {
        const bookDate = new Date(book.createdAt);
        const from = new Date(filterDateRange.from);
        from.setHours(0, 0, 0, 0);
        const to = filterDateRange.to
          ? new Date(filterDateRange.to)
          : new Date(filterDateRange.from);
        to.setHours(23, 59, 59, 999);
        if (bookDate < from || bookDate > to) return false;
      }
      return true;
    });
  }, [
    books,
    filterTitle,
    filterAuthor,
    filterGenre,
    filterStatus,
    filterDateRange,
  ]);

  async function handleDelete(bookId: string) {
    await fetch(`${API_URL}/api/books/${bookId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    onUpdate();
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  }

  const hasFilters =
    filterTitle ||
    filterAuthor ||
    filterGenre ||
    filterStatus !== "todos" ||
    filterDateRange?.from;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-gray-300">Filtros:</h1>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-gray-400 hover:text-white"
              onClick={() => {
                setFilterTitle("");
                setFilterAuthor("");
                setFilterGenre("");
                setFilterStatus("todos");
                setFilterDateRange(undefined);
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-3 border p-4 rounded-xl md:flex-row md:items-end md:flex-wrap md:gap-2">
          <Input
            placeholder="Titulo"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
            className="h-12 text-base bg-gray-900 md:h-8 md:text-sm md:flex-[3] md:min-w-0"
          />
          <Input
            placeholder="Autor"
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
            className="h-12 text-base bg-gray-900 md:h-8 md:text-sm md:flex-[2] md:min-w-0"
          />
          <Select
            value={filterGenre || "todos"}
            onValueChange={(v) => setFilterGenre(v === "todos" ? "" : v)}
          >
            <SelectTrigger className="h-12 text-base bg-gray-900 md:h-8 md:text-sm md:flex-[2] md:min-w-0">
              <SelectValue placeholder="Gênero" />
            </SelectTrigger>
            <SelectContent side="bottom" align="start" position="popper">
              <SelectItem value="todos">Todos os gêneros</SelectItem>
              {GENRE_OPTIONS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-12 text-base bg-gray-900 md:h-8 md:text-sm md:w-[130px] md:shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="quero_ler">Quero ler</SelectItem>
              <SelectItem value="lendo">Lendo</SelectItem>
              <SelectItem value="lido">Lido</SelectItem>
            </SelectContent>
          </Select>
          <DateRangePicker
            value={filterDateRange}
            onChange={setFilterDateRange}
            placeholder="Filtrar por período"
            className="h-12 bg-gray-900 md:h-8 md:w-52 md:shrink-0"
          />
        </div>
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-pink-400 text-gray-300 text-left font-mono">
              <th className="px-4 py-3 font-bold">Titulo</th>
              <th className="px-4 py-3 font-bold">Autor</th>
              <th className="px-4 py-3 font-bold">Genero</th>
              <th className="px-4 py-3 font-bold text-center">Nota</th>
              <th className="px-4 py-3 font-bold text-center">Releitura</th>
              <th className="px-4 py-3 font-bold">Concluído em</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredBooks.map((book) => (
              <tr
                key={book._id}
                className="hover:bg-gray-900/50 transition-colors"
              >
                <td className="px-4 py-3 font-semibold">{book.title}</td>
                <td className="px-4 py-3 text-gray-400">{book.author}</td>
                <td className="px-4 py-3 text-gray-400">{book.genre || "—"}</td>
                <td className="px-4 py-3 text-center text-gray-400">
                  {book.rating != null ? `${book.rating}/10` : "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  {book.isReread && (
                    <ArrowPathIcon
                      className="w-4 h-4 text-pink-300 mx-auto"
                      title="Releitura"
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {book.finishedAt ? formatDate(book.finishedAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  {STATUS_LABELS[book.status] ?? book.status}
                </td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {book.status !== status.LIDO && (
                        <DropdownMenuItem onClick={() => onEdit(book)}>
                          <PencilSquareIcon className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDelete(book._id)}
                        className="text-red-400 focus:text-red-400"
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filteredBooks.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                  Nenhum livro encontrado com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {filteredBooks.map((book) => (
          <div key={book._id} className="bg-gray-900 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold truncate">{book.title}</p>
                <p className="text-gray-400 text-sm">{book.author}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <EllipsisVerticalIcon className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {book.status !== status.LIDO && (
                    <DropdownMenuItem onClick={() => onEdit(book)}>
                      <PencilSquareIcon className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => handleDelete(book._id)}
                    className="text-red-400 focus:text-red-400"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {book.genre && <span>{book.genre}</span>}
              {book.rating != null && <span>Nota: {book.rating}/10</span>}
              {book.isReread && (
                <span className="flex items-center gap-1 text-pink-300">
                  <ArrowPathIcon className="w-3 h-3" /> Releitura
                </span>
              )}
              <span>{formatDate(book.createdAt)}</span>
              {book.finishedAt && (
                <span>Concluído: {formatDate(book.finishedAt)}</span>
              )}
            </div>
            <p className="text-pink-400 text-sm font-mono">
              {STATUS_LABELS[book.status] ?? book.status}
            </p>
          </div>
        ))}
        {filteredBooks.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-6">
            Nenhum livro encontrado com esses filtros.
          </p>
        )}
      </div>
    </div>
  );
}
