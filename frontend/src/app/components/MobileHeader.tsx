"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function MobileHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800">
      <span className="font-bold text-lg font-mono">BookQuest</span>
      <div className="md:hidden">
        <SidebarTrigger>
          <Bars3Icon className="w-5 h-5" />
        </SidebarTrigger>
      </div>
    </header>
  );
}
