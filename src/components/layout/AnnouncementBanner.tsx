"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import api from "@/lib/api";

interface Announcement {
  _id: string;
  message: string;
  isActive: boolean;
}

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { cachedGet } = await import("@/lib/api");
        const data = await cachedGet("/announcements/active", 180); // 3 minutes
        if (data.success && data.data) {
          setAnnouncement(data.data);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Error fetching announcement:", error);
      }
    };

    const timer = setTimeout(() => {
      fetchAnnouncement();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible || isDismissed || !announcement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-[#D4537E] text-white relative z-[60]"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="w-0 flex-1 flex items-center justify-center">
              <p className="font-medium text-sm sm:text-base text-center">
                {announcement.message}
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="flex p-1 rounded-md hover:bg-[#b04568] focus:outline-none transition-colors"
              >
                <span className="sr-only">Cerrar</span>
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
