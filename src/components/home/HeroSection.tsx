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
      
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_70%_20%,rgba(212,83,126,0.08)_0%,transparent_60%)]" />
        <div className="absolute top-1/2 right-0 w-full h-full bg-[radial-gradient(ellipse_at_80%_50%,rgba(212,83,126,0.12)_0%,transparent_70%)]" />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none opacity-20 select-none overflow-hidden">
        {/* Lipstick Icon */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[5%] text-[#D4537E]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
             <path d="M19 12c-1.1 0-2 .9-2 2v6h2c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM5 12c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2v-6c0-1.1-.9-2-2-2zM12 3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2s2-.9 2-2V5c0-1.1-.9-2-2-2z" />
          </svg>
        </motion.div>
        
        {/* Star Icon */}
        <motion.div 
          animate={{ y: [0, 12, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[25%] left-[45%] text-[#F2C4D8]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </motion.div>

        {/* Heart Icon */}
        <motion.div 
          animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[65%] left-[8%] text-[#D4537E]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>

        {/* Sparkle 1 */}
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[45%] text-[#F2C4D8]"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.5.5c.3.8 1.1 1.6 1.9 1.9-.8.3-1.6 1.1-1.9 1.9-.3-.8-1.1-1.6-1.9-1.9.8-.3 1.6-1.1 1.9-1.9zM19 6.5c.3.8 1.1 1.6 1.9 1.9-.8.3-1.6 1.1-1.9 1.9-.3-.8-1.1-1.6-1.9-1.9.8-.3 1.6-1.1 1.9-1.9zM12 12.5c.6 1.7 2.2 3.3 3.9 3.9-1.7.6-3.3 2.2-3.9 3.9-.6-1.7-2.2-3.3-3.9-3.9 1.7-.6 3.3-2.2 3.9-3.9z" />
          </svg>
        </motion.div>

        {/* Flower Icon */}
        <motion.div 
          animate={{ y: [0, 8, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] right-[5%] text-[#F2C4D8]"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm0-15c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6z" /><circle cx="12" cy="13" r="3" />
          </svg>
        </motion.div>
      </div>

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