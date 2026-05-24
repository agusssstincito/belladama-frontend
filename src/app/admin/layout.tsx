"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Package, ShoppingCart, LogOut, Archive, ExternalLink, Menu, X, Tag, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const sidebarLinks = [
  { href: "/admin/productos", label: "Productos", icon: Package, enabled: true },
  { href: "/admin/stock", label: "Stock", icon: Archive, enabled: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart, enabled: true },
  { href: "/admin/ofertas", label: "Ofertas", icon: Tag, enabled: true },
  { href: "/admin/resenas", label: "Reseñas", icon: MessageSquare, enabled: true },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-[#FFF0F5]">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-[#D4537E]/10 bg-white px-4 md:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-xl p-2 text-[#3D2035] hover:bg-[#FFF0F5] transition-colors"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <span className="font-heading text-xl font-bold tracking-tight text-[#3D2035]">Bella Dama Admin</span>
      </div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-[#3D2035]/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col bg-[#3D2035] transition-transform duration-300 ease-in-out md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-white/10">
          <Link
            href="/admin/productos"
            onClick={() => setIsSidebarOpen(false)}
            className="font-heading text-2xl font-bold tracking-tight text-white"
          >
            Bella Dama
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white/15 text-white shadow-sm ring-1 ring-white/10"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-white/10 p-4 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-5 w-5 text-pink-400" />
            Ver tienda
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen pt-16 md:pt-0 md:ml-[240px]">
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
