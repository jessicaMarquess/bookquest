"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";

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

interface BookTableProps {
  books: Book[];
  token: string;
  onUpdate: () => void;
  onEdit: (book: Book) => void;
}

export default function BookTable({ books, token, onUpdate, onEdit }: BookTableProps) {
  const [filterTitle, setFilterTitle] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterDate, setFilterDate] = useState("");

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
      if (filterStatus !== "todos" && book.status !== filterStatus)
        return false;
      if (filterDate && book.createdAt) {
        const bookDate = new Date(book.createdAt).toISOString().split("T")[0];
        if (bookDate !== filterDate) return false;
      }
      return true;
    });
  }, [books, filterTitle, filterAuthor, filterGenre, filterStatus, filterDate]);

  async function handleStatusChange(bookId: string, newStatus: string) {
    await fetch(`/api/books/${bookId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    onUpdate();
  }

  async function handleDelete(bookId: string) {
    await fetch(`/api/books/${bookId}`, {
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
    filterDate;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="space-y-2">
        <h1 className="font-mono text-gray-300">Filtros: </h1>
        <div className="grid grid-cols-2 gap-2 border p-4 rounded-xl md:flex md:items-end">
          <Input
            placeholder="Titulo"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
            className="col-span-2 md:flex-[3] md:min-w-0 h-8 text-sm bg-gray-900"
          />
          <Input
            placeholder="Autor"
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
            className="md:flex-[2] md:min-w-0 h-8 text-sm bg-gray-900"
          />
          <Input
            placeholder="Genero"
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="md:flex-[2] md:min-w-0 h-8 text-sm bg-gray-900"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 text-sm bg-gray-900 md:w-[130px] md:shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="quero_ler">Quero ler</SelectItem>
              <SelectItem value="lendo">Lendo</SelectItem>
              <SelectItem value="lido">Lido</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="h-8 text-sm bg-gray-900 md:w-40 md:shrink-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
          />
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="col-span-2 h-8 text-xs text-gray-400 hover:text-white"
              onClick={() => {
                setFilterTitle("");
                setFilterAuthor("");
                setFilterGenre("");
                setFilterStatus("todos");
                setFilterDate("");
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900 text-gray-300 text-left font-mono">
              <th className="px-4 py-3 font-medium">Titulo</th>
              <th className="px-4 py-3 font-medium">Autor</th>
              <th className="px-4 py-3 font-medium">Genero</th>
              <th className="px-4 py-3 font-medium text-center">Nota</th>
              <th className="px-4 py-3 font-medium text-center">Releitura</th>
              <th className="px-4 py-3 font-medium">Adicionado em</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium w-10"></th>
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
                  {formatDate(book.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={book.status}
                    onValueChange={(v) => handleStatusChange(book._id, v)}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quero_ler">Quero ler</SelectItem>
                      <SelectItem value="lendo">Lendo</SelectItem>
                      <SelectItem value="lido">Lido</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {book.status === "lendo" && (
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
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
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
                  {book.status === "lendo" && (
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
            </div>
            <Select
              value={book.status}
              onValueChange={(v) => handleStatusChange(book._id, v)}
            >
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quero_ler">Quero ler</SelectItem>
                <SelectItem value="lendo">Lendo</SelectItem>
                <SelectItem value="lido">Lido</SelectItem>
              </SelectContent>
            </Select>
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
