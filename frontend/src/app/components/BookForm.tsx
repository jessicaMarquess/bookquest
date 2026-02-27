"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { API_URL } from "@/lib/api";

interface Book {
  _id: string;
  title: string;
  author: string;
  status: string;
  genre?: string;
  rating?: number | null;
  isReread?: boolean;
}

interface BookFormProps {
  token: string;
  onBookAdded: () => void;
  onClose: () => void;
  editBook?: Book;
}

export default function BookForm({
  token,
  onBookAdded,
  onClose,
  editBook,
}: BookFormProps) {
  const [title, setTitle] = useState(editBook?.title ?? "");
  const [author, setAuthor] = useState(editBook?.author ?? "");
  const [genre, setGenre] = useState(editBook?.genre ?? "");
  const [rating, setRating] = useState(
    editBook?.rating != null ? String(editBook.rating) : "",
  );
  const [status, setStatus] = useState(editBook?.status ?? "quero_ler");
  const [isReread, setIsReread] = useState(editBook?.isReread ?? false);

  const isEditing = !!editBook;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = isEditing ? `${API_URL}/api/books/${editBook._id}` : `${API_URL}/api/books`;
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        author,
        status,
        genre,
        rating: rating !== "" ? Number(rating) : null,
        isReread,
      }),
    });

    if (res.ok) {
      onBookAdded();
      onClose();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Input
        placeholder="Autor"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        required
      />
      <Input
        placeholder="Gênero"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
      />
      <div className="flex gap-3">
        <Input
          type="number"
          placeholder="Nota (0-10)"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          min={0}
          max={10}
          className="flex-1"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quero_ler">Quero ler</SelectItem>
            <SelectItem value="lendo">Lendo</SelectItem>
            <SelectItem value="lido">Lido</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="isReread"
          checked={isReread}
          onCheckedChange={(checked) => setIsReread(checked === true)}
        />
        <label
          htmlFor="isReread"
          className="text-sm text-gray-400 cursor-pointer"
        >
          Releitura
        </label>
      </div>
      <Button type="submit" className="w-full bg-pink-400 hover:bg-pink-500">
        {isEditing ? "Salvar" : "Adicionar"}
      </Button>
    </form>
  );
}
