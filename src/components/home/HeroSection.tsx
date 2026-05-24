"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { fadeUp, slideFromBottom } from "@/lib/animations";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-lumiere-cream" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl lg:grid lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col justify-center px-4 py-20 lg:px-8 lg:py-0">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="space-y-6"
          >
            <motion.div
              variants={slideFromBottom}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-lumiere-blush/30 px-4 py-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lumiere-rose opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-lumiere-rose"></span>
              </span>
              <span className="text-sm font-medium text-lumiere-roseDark">
                Nueva línea Bella Dama
              </span>
            </motion.div>

            <h1 className="font-heading text-5xl font-bold leading-tight text-lumiere-charcoal lg:text-7xl">
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              >
                Resalta 
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
              >
                la belleza
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
                className="text-lumiere-rose"
              >
                que tienes 
              </motion.span>
            </h1>

            <motion.p
              variants={fadeUp}
              className="max-w-md font-accent text-xl text-lumiere-muted lg:text-2xl"
            >
              Descubrí nuestra línea de productos y maquillaje de alta cobertura.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-4">
              <Link href="/products">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="primary" size="lg">
                    Explorar colección
                  </Button>
                </motion.div>
              </Link>
              <Link href="/products?sortBy=newest">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="outline" size="lg">
                    Ver novedades
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative hidden h-full lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0 bg-gradient-to-br from-lumiere-blush/20 to-lumiere-rose/10 rounded-l-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1709477542170-f11ee7d471a0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center bg-no-repeat rounded-l-3xl"
          />
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gradient-to-br from-lumiere-blush/30 to-transparent rounded-l-3xl"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-lumiere-muted"
        >
          <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}