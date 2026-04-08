"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ArrowRightStartOnRectangleIcon,
  ChartBarIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { label: "Estatísticas", href: "/stats", icon: ChartBarIcon },
];

interface AppSidebarProps {
  userName: string;
}

function AppSidebarInner({ userName }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { open, setOpen } = useSidebar();
  const pinnedRef = useRef(false);

  function handleMouseEnter() {
    if (!pinnedRef.current) setOpen(true);
  }

  function handleMouseLeave() {
    if (!pinnedRef.current) setOpen(false);
  }

  function handleTrigger() {
    pinnedRef.current = !open;
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <SidebarTrigger onClick={handleTrigger} className="shrink-0" />
          <span className="font-bold text-base font-mono group-data-[collapsible=icon]:hidden truncate">
            BookQuest
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 group-data-[collapsible=icon]:hidden">
          Olá, <strong>{userName}</strong>
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href} tooltip={label}>
                    <Link href={href}>
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Sair"
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AppSidebar({ userName }: AppSidebarProps) {
  return <AppSidebarInner userName={userName} />;
}
