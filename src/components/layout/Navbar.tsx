"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Menu, Search, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBumping, setIsBumping] = useState(false);
  const { openCart, getTotalItems } = useCartStore();
  const { fetchWishlist, items: wishlistItems } = useWishlistStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const cartItemCount = getTotalItems();
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      fetchWishlist();
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (cartItemCount === 0) return;
    setIsBumping(true);
    const timer = setTimeout(() => {
      setIsBumping(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [cartItemCount]);

  const menuCategories = [
    { name: 'Rostro / Tez', slug: 'rostro-tez' },
    { name: 'Mejillas y Pómulos', slug: 'mejillas-pomulos' },
    { name: 'Ojos y Párpados', slug: 'ojos-parpados' },
    { name: 'Cejas', slug: 'cejas' },
    { name: 'Labios', slug: 'labios' },
    { name: 'Skincare', slug: 'skincare' },
    { name: 'Uñas', slug: 'unas' },
  ];

  const navLinks = [
    { href: "/products", label: "Tienda Completa" },
    { href: "/nosotros", label: "Nosotros" },
    { href: "/contacto", label: "Contacto" },
    { href: "/faqs", label: "Preguntas Frecuentes" },
  ];

  const dynamicNavLinks = [...navLinks];
  if (isAuthenticated) {
    if (user?.role === "admin") {
      dynamicNavLinks.push({ href: "/admin", label: "Panel Admin" });
    } else {
      dynamicNavLinks.push({ href: "/account", label: "Mi cuenta" });
    }
  }

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed left-0 right-0 top-0 z-40 transition-all duration-500",
          isScrolled
            ? "bg-lumiere-light/80 shadow-soft backdrop-blur-xl py-2"
            : "bg-transparent py-4"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-lumiere-charcoal lg:hidden hover:bg-lumiere-warm rounded-full transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          <nav className="hidden gap-8 lg:flex items-center">
            <div className="group relative">
              <button className="text-sm font-medium text-lumiere-charcoal/80 hover:text-lumiere-rose transition-colors duration-300 py-4">
                Categorías
              </button>
              <div className="absolute left-0 top-full hidden w-56 flex-col rounded-xl bg-white shadow-soft-lg group-hover:flex py-2 border border-lumiere-warm z-50">
                {menuCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="px-4 py-2.5 text-sm font-medium text-lumiere-charcoal/80 hover:bg-[#FFF0F5] hover:text-[#D4537E] transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            {dynamicNavLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
              >
                <Link
                  href={link.href}
                  className="group relative text-sm font-medium text-lumiere-charcoal/80 hover:text-lumiere-rose transition-colors duration-300"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-lumiere-rose transition-all duration-300 group-hover:w-full" />
                </Link>
              </motion.div>
            ))}
            {isAuthenticated && (
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={logout}
                className="text-sm font-medium text-lumiere-charcoal/80 hover:text-lumiere-rose transition-colors duration-300"
              >
                Salir
              </motion.button>
            )}
          </nav>

          <Link href="/" className="font-heading text-3xl font-bold tracking-tight text-lumiere-charcoal hover:scale-105 transition-transform duration-300">
            Bella Dama
          </Link>

          <div className="flex items-center gap-1 md:gap-2">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(true)}
              className="rounded-full p-2 text-lumiere-charcoal hover:bg-lumiere-warm/50 transition-colors"
            >
              <Search className="h-5 w-5" />
            </motion.button>

            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 200)}
                className="rounded-full p-2 text-lumiere-charcoal hover:bg-lumiere-warm/50 transition-colors"
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <User className="h-5 w-5" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-soft-lg border border-lumiere-warm py-2 z-50 overflow-hidden"
                  >
                    {!isAuthenticated ? (
                      <>
                        <Link
                          href="/login"
                          className="block px-4 py-2 text-sm text-lumiere-charcoal hover:bg-[#FFF0F5] hover:text-[#D4537E]"
                        >
                          Iniciar sesión
                        </Link>
                        <Link
                          href="/register"
                          className="block px-4 py-2 text-sm text-lumiere-charcoal hover:bg-[#FFF0F5] hover:text-[#D4537E]"
                        >
                          Registrarse
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 border-bottom border-lumiere-warm mb-1">
                          <p className="text-xs font-bold text-lumiere-charcoal/40 uppercase">Hola, {user?.name.split(' ')[0]}</p>
                        </div>
                        <Link
                          href={user?.role === 'admin' ? '/admin' : '/account'}
                          className="block px-4 py-2 text-sm text-lumiere-charcoal hover:bg-[#FFF0F5] hover:text-[#D4537E]"
                        >
                          {user?.role === 'admin' ? 'Panel Admin' : 'Mi cuenta'}
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-sm text-lumiere-charcoal hover:bg-[#FFF0F5] hover:text-[#D4537E]"
                        >
                          Cerrar sesión
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/account/wishlist"
              className="relative rounded-full p-2 text-lumiere-charcoal hover:bg-lumiere-warm/50 transition-colors"
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Heart className="h-5 w-5" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -right-0 -top-0 flex h-4 w-4 items-center justify-center rounded-full bg-lumiere-rose text-[10px] font-bold text-lumiere-light shadow-glow">
                    {wishlistCount}
                  </span>
                )}
              </motion.div>
            </Link>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={openCart}
              className={`relative rounded-full p-2 text-lumiere-charcoal hover:bg-lumiere-warm/50 transition-colors ${
                isBumping ? "animate-bump" : ""
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -right-0 -top-0 flex h-4 w-4 items-center justify-center rounded-full bg-lumiere-rose text-[10px] font-bold text-lumiere-light shadow-glow">
                  {cartItemCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            links={dynamicNavLinks}
            categories={menuCategories}
          />
        )}
      </AnimatePresence>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}