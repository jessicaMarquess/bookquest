"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/lib/api";
import { GENRE_OPTIONS, STATUS_LABELS } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";

interface Book {
  _id: string;
  title: string;
  author: string;
  status: string;
  genre?: string;
  rating?: number | null;
  isReread?: boolean;
  finishedAt?: string | null;
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
  const [titleSuggestions, setTitleSuggestions] = useState<{ title: string; author: string }[]>([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const skipTitleFetch = useRef(!!editBook);
  const [author, setAuthor] = useState(editBook?.author ?? "");
  const [authorSuggestions, setAuthorSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const skipAuthorFetch = useRef(!!editBook);
  const authorRef = useRef<HTMLDivElement>(null);
  const [genre, setGenre] = useState(editBook?.genre ?? "");
  const [rating, setRating] = useState(
    editBook?.rating != null ? String(editBook.rating) : "",
  );
  const [status, setStatus] = useState(editBook?.status ?? "quero_ler");
  const [isReread, setIsReread] = useState(editBook?.isReread ?? false);
  const [finishedAt, setFinishedAt] = useState(
    editBook?.finishedAt
      ? new Date(editBook.finishedAt).toISOString().split("T")[0]
      : "",
  );

  useEffect(() => {
    if (skipTitleFetch.current) {
      skipTitleFetch.current = false;
      return;
    }
    if (title.length < 2) {
      setTitleSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=5&language=por`,
        );
        const data = await res.json();
        const suggestions = data.docs?.map((d: { title: string; author_name?: string[] }) => ({
          title: d.title,
          author: d.author_name?.[0] ?? "",
        })) ?? [];
        setTitleSuggestions(suggestions);
        setShowTitleSuggestions(true);
      } catch {
        setTitleSuggestions([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [title]);

  useEffect(() => {
    if (skipAuthorFetch.current) {
      skipAuthorFetch.current = false;
      return;
    }
    if (author.length < 2) {
      setAuthorSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(author)}&limit=5`,
        );
        const data = await res.json();
        setAuthorSuggestions(data.docs?.map((d: { name: string }) => d.name) ?? []);
        setShowSuggestions(true);
      } catch {
        setAuthorSuggestions([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [author]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (titleRef.current && !titleRef.current.contains(e.target as Node)) {
        setShowTitleSuggestions(false);
      }
      if (authorRef.current && !authorRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isEditing = !!editBook;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = isEditing
      ? `${API_URL}/api/books/${editBook._id}`
      : `${API_URL}/api/books`;
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
        finishedAt: status === "lido" && finishedAt ? finishedAt : null,
      }),
    });

    if (res.ok) {
      onBookAdded();
      onClose();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div ref={titleRef} className="relative">
        <Input
          className="h-12 text-base sm:h-9 sm:text-sm"
          placeholder="Título"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setShowTitleSuggestions(true);
          }}
          onFocus={() => titleSuggestions.length > 0 && setShowTitleSuggestions(true)}
          required
        />
        {showTitleSuggestions && titleSuggestions.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-md overflow-hidden">
            {titleSuggestions.map((item) => (
              <li
                key={item.title + item.author}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onMouseDown={() => {
                  skipTitleFetch.current = true;
                  if (item.author) skipAuthorFetch.current = true;
                  setTitle(item.title);
                  if (item.author) setAuthor(item.author);
                  setTitleSuggestions([]);
                  setShowTitleSuggestions(false);
                }}
              >
                <span>{item.title}</span>
                {item.author && (
                  <span className="text-muted-foreground ml-2">— {item.author}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div ref={authorRef} className="relative">
        <Input
          className="h-12 text-base sm:h-9 sm:text-sm"
          placeholder="Autor"
          value={author}
          onChange={(e) => {
            setAuthor(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => authorSuggestions.length > 0 && setShowSuggestions(true)}
          required
        />
        {showSuggestions && authorSuggestions.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-md overflow-hidden">
            {authorSuggestions.map((name) => (
              <li
                key={name}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onMouseDown={() => {
                  skipAuthorFetch.current = true;
                  setAuthor(name);
                  setAuthorSuggestions([]);
                  setShowSuggestions(false);
                }}
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Select value={genre} onValueChange={setGenre}>
        <SelectTrigger className="h-12 text-base sm:h-9 sm:text-sm">
          <SelectValue placeholder="Gênero" />
        </SelectTrigger>
        <SelectContent side="bottom" align="start" position="popper">
          {GENRE_OPTIONS.map((g) => (
            <SelectItem key={g} value={g}>
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="number"
          placeholder="Nota (0-10)"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          min={0}
          max={10}
          className="h-12 text-base sm:h-9 sm:text-sm sm:flex-1"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-12 text-base sm:h-9 sm:text-sm sm:flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {status === "lido" && (
        <DatePicker
          value={finishedAt}
          onChange={setFinishedAt}
          placeholder="Data de conclusão"
        />
      )}
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
      <Button
        type="submit"
        className="w-full bg-pink-400 hover:bg-pink-500"
        disabled={status === "lido" && (!finishedAt || rating === "")}
      >
        {isEditing ? "Salvar" : "Adicionar"}
      </Button>
    </form>
  );
}
