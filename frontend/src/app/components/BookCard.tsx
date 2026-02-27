"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrashIcon } from "@heroicons/react/24/outline";

interface Book {
  _id: string;
  title: string;
  author: string;
  status: string;
  genre?: string;
  rating?: number | null;
  isReread?: boolean;
}

interface BookCardProps {
  book: Book;
  token: string;
  onUpdate: () => void;
}

export default function BookCard({ book, token, onUpdate }: BookCardProps) {
  async function handleStatusChange(newStatus: string) {
    await fetch(`/api/books/${book._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    onUpdate();
  }

  async function handleDelete() {
    await fetch(`/api/books/${book._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    onUpdate();
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="font-semibold">{book.title}</p>
        <p className="text-gray-400 text-sm">{book.author}</p>
        <div className="flex gap-3 text-xs text-gray-500 mt-1">
          {book.genre && <span>{book.genre}</span>}
          {book.rating != null && <span>Nota: {book.rating}/10</span>}
          {book.isReread && <span>Releitura</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Select value={book.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[130px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quero_ler">Quero ler</SelectItem>
            <SelectItem value="lendo">Lendo</SelectItem>
            <SelectItem value="lido">Lido</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
          title="Remover"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
