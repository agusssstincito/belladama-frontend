"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { Star, User as UserIcon } from "lucide-react";
import api from "@/lib/api";

interface Testimonial {
  _id: string;
  customerName: string;
  comment: string;
  rating: number;
  avatar?: string;
}

export function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { cachedGet } = await import("@/lib/api");
        const data = await cachedGet("/testimonials", 600); // 10 minutes
        if (data.success) {
          setTestimonials(data.data);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (isLoading || testimonials.length === 0) return null;

  return (
    <section className="bg-lumiere-warm py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-4xl font-bold text-lumiere-charcoal lg:text-5xl">
            Clientes satisfechas
          </h2>
          <p className="mt-4 font-accent text-xl text-lumiere-muted">
            Descubrí qué dicen nuestras clientas
          </p>
        </motion.div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="min-w-0 flex-[0_0_85%] pl-4 sm:flex-[0_0_45%] lg:flex-[0_0_30%]"
              >
                <div className="h-full rounded-3xl bg-lumiere-light p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-white shadow-sm flex items-center justify-center">
                      {testimonial.avatar ? (
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.customerName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-6 w-6 text-lumiere-rose/40" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-lumiere-charcoal">
                        {testimonial.customerName}
                      </h4>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating
                                ? "fill-lumiere-gold text-lumiere-gold"
                                : "fill-gray-100 text-gray-100"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-lumiere-muted italic">&quot;{testimonial.comment}&quot;</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}