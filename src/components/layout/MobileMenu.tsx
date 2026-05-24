"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { X, Heart, User, ShoppingBag } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  categories: { name: string; slug: string }[];
}

export function MobileMenu({ onClose, links, categories }: MobileMenuProps) {
  const { items: wishlistItems } = useWishlistStore();
  const { getTotalItems, openCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartItemCount = getTotalItems();

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-lumiere-charcoal/50 backdrop-blur-sm lg:hidden"
      />
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed left-0 top-0 z-50 h-full w-80 bg-lumiere-light shadow-soft-lg lg:hidden flex flex-col"
      >
        <div className="flex-shrink-0 flex h-20 items-center justify-between px-6 border-b border-lumiere-warm/30">
          <span className="font-heading text-xl font-bold">Bella Dama</span>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-lumiere-charcoal hover:bg-lumiere-warm"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pt-8 pb-12 px-6">
          <nav>
            <ul className="space-y-6">
              <li>
                <span className="block font-heading text-lg font-bold text-lumiere-charcoal border-b border-lumiere-warm pb-2 mb-4">
                  Categorías
                </span>
                <ul className="space-y-4 pl-4 border-l-2 border-lumiere-warm">
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/categories/${cat.slug}`}
                        onClick={onClose}
                        className="block font-medium text-lumiere-charcoal/80"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="h-px w-full bg-lumiere-warm/50 my-4"></li>
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block font-heading text-lg font-medium text-lumiere-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 space-y-4">
            <Link
              href="/account/wishlist"
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-lumiere-warm py-3 w-full"
            >
              <Heart className="h-5 w-5" />
              <span className="text-sm font-medium">Wishlist</span>
              {wishlistItems.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lumiere-rose text-[10px] text-lumiere-light">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => {
                onClose();
                openCart();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lumiere-rose py-3 text-lumiere-light shadow-soft hover:shadow-md transition-shadow"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="text-sm font-medium">Carrito</span>
              {cartItemCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lumiere-roseDark text-[10px] text-lumiere-light">
                  {cartItemCount}
                </span>
              )}
            </button>

            <Link
              href="/account"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-lumiere-charcoal py-3"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Mi cuenta</span>
            </Link>

            {isAuthenticated && (
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#D4537E] text-[#D4537E] py-3 font-medium hover:bg-[#FFF0F5] transition-colors"
              >
                Salir
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}