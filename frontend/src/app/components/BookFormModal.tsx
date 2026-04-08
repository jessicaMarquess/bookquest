"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import BookForm from "./BookForm";

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

interface BookFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  onBookAdded: () => void;
  editBook?: Book | null;
}

export default function BookFormModal({
  open,
  onOpenChange,
  token,
  onBookAdded,
  editBook,
}: BookFormModalProps) {
  const isMobile = useIsMobile();
  const title = editBook ? "Editar livro" : "Adicionar livro";
  const description = editBook
    ? "Altere os dados do livro"
    : "Preencha os dados do livro";

  const form = (
    <BookForm
      key={editBook?._id ?? "new"}
      token={token}
      onBookAdded={onBookAdded}
      onClose={() => onOpenChange(false)}
      editBook={editBook ?? undefined}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-auto">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-8 pb-6">{form}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}
