"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Background3D } from "@/components/home/Background3D";
import { useDiscountStore } from "@/stores/useDiscountStore";
import { useCartStore } from "@/stores/cartStore";

export function ShopShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const { fetchActiveDiscounts, activeDiscounts } = useDiscountStore();
  const refreshPrices = useCartStore((state) => state.refreshPrices);

  useEffect(() => {
    fetchActiveDiscounts();
  }, [fetchActiveDiscounts]);

  useEffect(() => {
    if (activeDiscounts.length > 0) {
      refreshPrices();
    }
  }, [activeDiscounts, refreshPrices]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Background3D />
      <AnnouncementBanner />
      <Navbar />
      <CartDrawer />
      {children}
      <Footer />
    </>
  );
}
