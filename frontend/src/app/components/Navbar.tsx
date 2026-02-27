"use client";
import {
  ArrowRightStartOnRectangleIcon,
  ChartBarIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  userName: string;
}

export default function Navbar({ userName }: NavbarProps) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <nav className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="font-bold text-lg sm:text-xl font-mono">BookQuest</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild title="Dashboard">
              <Link href="/dashboard">
                <HomeIcon className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild title="Estatisticas">
              <Link href="/stats">
                <ChartBarIcon className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-gray-400 text-sm hidden sm:block">
            Olá, <strong>{userName}</strong>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            title="Sair"
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
