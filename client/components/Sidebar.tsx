"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart2,
  CheckSquare,
  Users,
  Settings,
  FolderOpen,
  Search,
  Bell,
  LogOut,
  Hexagon,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import SearchModal from "./SearchModal";
import { clearSessionStorage, logoutUser } from "@/features/auth/api";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/dashboard/my-tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
];

const workspaceLinks = [
  { href: "/workspace/members", label: "Members", icon: Users },
  { href: "/workspace/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    clearSessionStorage();
    router.push("/login");
  };

  return (
    <>
      <aside
        className="relative flex h-full w-[17.5rem] shrink-0 flex-col border-r shadow-2xl"
        style={{
          background:
            "linear-gradient(180deg, #0c0e11 0%, #12151a 48%, #0c0e11 100%)",
          borderColor: "var(--sidebar-border)",
        }}
      >
        {/* Accent rail */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-0.5"
          style={{
            background:
              "linear-gradient(180deg, var(--sidebar-accent) 0%, rgba(20,184,166,0.35) 40%, transparent 85%)",
          }}
        />

        {/* Brand */}
        <div
          className="relative flex h-[3.75rem] items-center gap-3 px-5"
          style={{ borderBottom: "1px solid var(--sidebar-border)" }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-lg"
            style={{
              background:
                "linear-gradient(145deg, #14b8a6 0%, #0d9488 45%, #0f766e 100%)",
              boxShadow:
                "0 8px 20px rgba(13,148,136,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <Hexagon size={20} strokeWidth={2.25} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-display truncate text-[15px] font-semibold tracking-tight text-zinc-100">
              WorkCentral
            </p>
            <p className="truncate text-[11px] font-medium tracking-wide text-zinc-500">
              Workspace OS
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pt-4">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors"
            style={{
              background: "var(--sidebar-surface)",
              color: "#a1a1aa",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Search size={16} className="shrink-0 text-zinc-500" />
            <span className="flex-1 truncate">Search workspace…</span>
            <kbd
              className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#71717a",
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-2.5 py-5">
          <SidebarSection label="Overview">
            {navLinks.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                active={isActive(link.href)}
              >
                {link.label}
              </SidebarLink>
            ))}
          </SidebarSection>

          <SidebarSection label="Workspace">
            {workspaceLinks.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                active={isActive(link.href)}
              >
                {link.label}
              </SidebarLink>
            ))}
          </SidebarSection>
        </nav>

        <div
          className="relative space-y-1 px-2.5 py-4"
          style={{ borderTop: "1px solid var(--sidebar-border)" }}
        >
          <div
            className="flex items-center rounded-xl px-3 py-2"
            style={{ background: "var(--sidebar-surface)" }}
          >
            <Bell size={15} className="mr-2.5 shrink-0 text-zinc-500" />
            <span className="flex-1 text-sm font-medium text-zinc-400">
              Alerts
            </span>
            <NotificationBell compact />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
          >
            <LogOut size={15} className="shrink-0 opacity-80" />
            Sign out
          </button>
        </div>
      </aside>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function SidebarSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  active,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-all",
        active
          ? "text-white shadow-md"
          : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200",
      ].join(" ")}
      style={
        active
          ? {
              background:
                "linear-gradient(90deg, rgba(20,184,166,0.22) 0%, rgba(20,184,166,0.08) 100%)",
              boxShadow: "inset 0 0 0 1px rgba(20,184,166,0.25)",
            }
          : undefined
      }
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-full"
          style={{ background: "var(--sidebar-accent)" }}
        />
      )}
      <Icon
        size={17}
        className={[
          "shrink-0 transition-colors",
          active ? "text-teal-300" : "text-zinc-500 group-hover:text-zinc-400",
        ].join(" ")}
      />
      {children}
    </Link>
  );
}
