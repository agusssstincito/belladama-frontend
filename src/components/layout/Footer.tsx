"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

interface SocialIconProps {
  className?: string;
}

function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon({ className }: SocialIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );
}

export function Footer() {

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { href: "/products", label: "Tienda" },
      { href: "/nosotros", label: "Nosotros" },
    ],
    help: [
      { href: "/faqs", label: "Preguntas Frecuentes" },
      { href: "/contacto", label: "Contacto" },
    ],
    company: [
      { href: "/nosotros", label: "Nosotros" },
      { href: "/faqs", label: "Preguntas Frecuentes" },
    ],
  };

  const socialLinks = [
    { icon: InstagramIcon, href: "https://instagram.com", label: "Instagram" },
    { icon: FacebookIcon, href: "https://facebook.com", label: "Facebook" },
    { icon: TwitterIcon, href: "https://twitter.com", label: "Twitter" },
  ];

  return (
    <footer className="bg-lumiere-charcoal text-lumiere-light">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="font-heading text-3xl font-bold">
              Bella Dama
            </Link>
            <p className="mt-4 max-w-xs font-body text-base text-lumiere-charcoal">
              Descubrí nuestra línea de correctores y maquillaje de alta cobertura.
            </p>

          </div>

          <div>
            <h4 className="mb-4 font-heading text-lg">Tienda</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-lumiere-charcoal hover:text-lumiere-rose transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-lg">Ayuda</h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-lumiere-charcoal hover:text-lumiere-rose transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-lg">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-lumiere-charcoal hover:text-lumiere-rose transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-lumiere-muted/20 pt-8 md:flex-row">
          <p className="text-sm text-lumiere-muted">
            © {currentYear} Bella Dama. Todos los derechos reservados.
          </p>

          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-lumiere-rose/10 text-lumiere-rose hover:bg-lumiere-rose hover:text-lumiere-light transition-all"
              >
                <social.icon className="h-5 w-5" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}