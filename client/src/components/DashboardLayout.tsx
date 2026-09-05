import { useAuth } from "@/_core/hooks/useAuth";
import { resolveEdvRole } from "../../../shared/rbac";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { Activity, Banknote, Bot, BriefcaseBusiness, FileCheck2, LayoutDashboard, Landmark, LogOut, PanelLeft, ShieldCheck, Search, Command, Sparkles, ChevronRight } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import NotificationCenter from "./NotificationCenter";

const menuItems = [
  { icon: LayoutDashboard, label: "Visión general", path: "/", audience: "all" },
  { icon: BriefcaseBusiness, label: "Clientes y empleados", path: "/maestros", audience: "internal" },
  { icon: Bot, label: "Asistente y Red ADN", path: "/asistente", audience: "internal" },
  { icon: Landmark, label: "Órganos operativos", path: "/organos", audience: "internal" },
  { icon: Banknote, label: "Banca y conciliación", path: "/banca", audience: "internal" },
  { icon: ShieldCheck, label: "Homologación ARCA", path: "/configuracion-fiscal", audience: "internal" },
  { icon: Landmark, label: "Conectar Open Banking", path: "/open-banking", audience: "internal" },
  { icon: ShieldCheck, label: "Panel RBAC", path: "/rbac", audience: "internal" },
  { icon: FileCheck2, label: "Aprobaciones y documentos", path: "/aprobaciones", audience: "all" },
  { icon: Activity, label: "Preparación productiva", path: "/produccion", audience: "internal" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  const previewMode = import.meta.env.DEV;

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading && !previewMode) {
    return <DashboardLayoutSkeleton />
  }

  if (!user && !previewMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Sign in to continue
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Access to this dashboard requires authentication. Continue to launch the login flow.
            </p>
          </div>
          <Button
            onClick={() => startLogin()}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const currentRole = resolveEdvRole(user?.role);
  const visibleMenuItems = menuItems.filter(item => item.audience === "all" || item.audience === currentRole || (currentRole === "partner" && item.audience === "internal"));
  const canSeePartnerNotifications = currentRole === "partner";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = visibleMenuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-white/[0.07] bg-[#0b0c11]"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-auto px-3 pb-4 pt-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3">
              <button onClick={toggleSidebar} className="edv-orb flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform hover:scale-[1.04]" aria-label="Toggle navigation">
                <PanelLeft className="h-4 w-4" />
              </button>
              {!isCollapsed ? <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.22em] text-primary"><Sparkles className="h-3 w-3" /> EDV OS</div>
                <div className="mt-1 truncate text-sm font-semibold tracking-tight text-white">Enterprise Command</div>
              </div> : null}
              {canSeePartnerNotifications ? <NotificationCenter userId={user?.id} /> : null}
            </div>
          </SidebarHeader>
          <SidebarContent className="gap-0 px-2">
            {!isCollapsed ? <div className="edv-kicker px-3 pb-2 pt-1">Workspace</div> : null}
            <SidebarMenu className="space-y-1 px-1 py-1">
              {visibleMenuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-11 rounded-xl px-3 transition-all font-medium text-[13px] hover:bg-white/[0.055] data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-[0_8px_28px_rgba(217,255,87,.12)]`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="m-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none text-foreground">
                      {user?.name || "Modo vista previa"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user ? (user.email || "Sesión local activa") : "Sin sesión iniciada"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex min-h-screen flex-1 flex-col">
          <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#08090d]/80 px-5 backdrop-blur-xl lg:px-8">
            <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><Command className="h-3.5 w-3.5 text-primary" /><span>EDV / {activeMenuItem?.label ?? "Workspace"}</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-foreground">Live</span></div>
            <div className="ml-auto flex items-center gap-3"><div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground sm:flex"><Search className="h-3.5 w-3.5" /> Buscar en EDV <kbd className="ml-6 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px]">⌘ K</kbd></div><span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_16px_rgba(217,255,87,.9)]" /></div>
          </div>
          <div className="flex-1 p-4 lg:p-7">{children}</div>
        </main>
      </SidebarInset>
    </>
  );
}