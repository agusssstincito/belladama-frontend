"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Plus, Trash2, Edit2, X, Save, User as UserIcon, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface Testimonial {
  _id: string;
  customerName: string;
  comment: string;
  rating: number;
  avatar?: string;
  isActive: boolean;
}

export default function AdminResenasPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    comment: "",
    rating: 5,
    avatar: "",
    isActive: true,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get("/testimonials/all");
      if (res.data.success) {
        setTestimonials(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/testimonials/${editingId}`, formData);
      } else {
        await api.post("/testimonials", formData);
      }
      fetchTestimonials();
      closeModal();
    } catch (error) {
      console.error("Error saving testimonial:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta reseña?")) return;
    try {
      await api.delete(`/testimonials/${id}`);
      fetchTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    }
  };

  const openModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setFormData({
        customerName: testimonial.customerName,
        comment: testimonial.comment,
        rating: testimonial.rating,
        avatar: testimonial.avatar || "",
        isActive: testimonial.isActive,
      });
      setEditingId(testimonial._id);
    } else {
      setFormData({
        customerName: "",
        comment: "",
        rating: 5,
        avatar: "",
        isActive: true,
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-[#3D2035]">Reseñas</h1>
          <p className="text-[#3D2035]/60">Gestioná los testimonios que se muestran en el inicio.</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-[#D4537E] hover:bg-[#c0466e] text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Reseña
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4537E]" />
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial._id}
              variants={fadeUp}
              className="group relative flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm border border-[#D4537E]/10"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-[#FFF0F5] flex items-center justify-center">
                      {testimonial.avatar ? (
                        <img src={testimonial.avatar} alt={testimonial.customerName} className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-[#D4537E]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#3D2035]">{testimonial.customerName}</h3>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < testimonial.rating ? "fill-[#FFD700] text-[#FFD700]" : "fill-gray-200 text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${testimonial.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {testimonial.isActive ? "Activo" : "Inactivo"}
                  </div>
                </div>
                <p className="text-sm text-[#3D2035]/70 italic line-clamp-4">&quot;{testimonial.comment}&quot;</p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-[#D4537E]/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(testimonial)}
                  className="rounded-full p-2 text-lumiere-charcoal hover:bg-[#FFF0F5] transition-colors"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(testimonial._id)}
                  className="rounded-full p-2 text-red-500 hover:bg-red-50 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-[#3D2035]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-xl"
            >
              <button
                onClick={closeModal}
                className="absolute right-6 top-6 rounded-full p-2 text-gray-400 hover:bg-[#FFF0F5] hover:text-[#3D2035] transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="mb-6 font-heading text-2xl font-bold text-[#3D2035]">
                {editingId ? "Editar Reseña" : "Nueva Reseña"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3D2035]/40">
                    Nombre de la Clienta
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full rounded-2xl border border-[#D4537E]/10 bg-[#FFF0F5]/30 px-4 py-3 text-[#3D2035] outline-none transition-all focus:border-[#D4537E] focus:bg-white"
                    placeholder="Ej: María García"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3D2035]/40">
                    Comentario
                  </label>
                  <textarea
                    required
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    rows={4}
                    className="w-full rounded-2xl border border-[#D4537E]/10 bg-[#FFF0F5]/30 px-4 py-3 text-[#3D2035] outline-none transition-all focus:border-[#D4537E] focus:bg-white"
                    placeholder="Escribí aquí el testimonio..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3D2035]/40">
                      Puntaje (Estrellas)
                    </label>
                    <div className="flex gap-1 pt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-6 w-6 ${star <= formData.rating ? "fill-[#FFD700] text-[#FFD700]" : "fill-gray-100 text-gray-200"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3D2035]/40">
                      Estado
                    </label>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-[#D4537E]/20 text-[#D4537E] focus:ring-[#D4537E]"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-[#3D2035]">Mostrar en el inicio</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3D2035]/40">
                    URL del Avatar (Opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full rounded-2xl border border-[#D4537E]/10 bg-[#FFF0F5]/30 px-4 py-3 text-[#3D2035] outline-none transition-all focus:border-[#D4537E] focus:bg-white"
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="flex-1 rounded-full border-2 border-[#D4537E]/10"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-full bg-[#D4537E] text-white hover:bg-[#c0466e] gap-2"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {editingId ? "Guardar Cambios" : "Crear Reseña"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
