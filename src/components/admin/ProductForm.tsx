"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Category } from "@/types";

const CATEGORIES_FALLBACK = [
  { name: "Rostro / Tez", slug: "rostro-tez" },
  { name: "Mejillas y Pómulos", slug: "mejillas-pomulos" },
  { name: "Ojos y Párpados", slug: "ojos-parpados" },
  { name: "Cejas", slug: "cejas" },
  { name: "Labios", slug: "labios" },
];

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: { slug: string } | null;
    images: { url: string }[];
    stock?: number;
    colors?: { name: string }[];
  };
}

export default function ProductForm({ mode, initialData }: ProductFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [stock, setStock] = useState(initialData?.stock?.toString() || "0");
  const [categorySlug, setCategorySlug] = useState(initialData?.category?.slug || "");
  const [colors, setColors] = useState<{ name: string }[]>(
    initialData?.colors && initialData.colors.length > 0
      ? initialData.colors
      : [{ name: "Consultar" }]
  );
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.images?.map((img) => img.url) || []
  );
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories");
      const data = response.data?.data || response.data;
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      } else {
        setCategories(CATEGORIES_FALLBACK as any);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories(CATEGORIES_FALLBACK as any);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const totalImages = existingImages.length + newImages.length;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const remaining = 4 - totalImages;
    const toAdd = imageFiles.slice(0, remaining);

    const newPreviews = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...newPreviews]);
    // Reset input value to allow selecting same files again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    const removed = newImages[index];
    URL.revokeObjectURL(removed.preview);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "El nombre es requerido";
    if (!price || Number(price) <= 0) newErrors.price = "El precio debe ser mayor a 0";
    if (Number(stock) < 0) newErrors.stock = "El stock no puede ser negativo";
    if (!categorySlug) newErrors.category = "Seleccioná una categoría";
    if (totalImages === 0) newErrors.images = "Subí al menos 1 imagen";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Convert new image files to base64
      const newBase64Images = await Promise.all(
        newImages.map((img) => fileToBase64(img.file))
      );

      const allImages = [...existingImages, ...newBase64Images];

      // Filter out any color with an empty name, keeping Consultar at index 0
      const filteredColors = colors.filter((c) => c.name.trim() !== "");

      const body = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categorySlug,
        images: allImages,
        colors: filteredColors,
      };

      if (mode === "create") {
        await api.post("/admin/productos", body);
        showToast("Producto creado exitosamente", "success");
      } else {
        await api.put(`/admin/productos/${initialData!._id}`, body);
        showToast("Producto actualizado exitosamente", "success");
      }

      router.push("/admin/productos");
    } catch {
      const msg = "Error al guardar el producto";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#F2C4D8] bg-white px-4 py-3 text-sm text-[#3D2035] placeholder-[#9C6B85]/50 outline-none transition-all focus:border-[#D4537E] focus:ring-2 focus:ring-[#D4537E]/20";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-2xl"
    >
      <div className="rounded-2xl bg-white p-6 shadow-sm lg:p-8">
        <h1 className="mb-8 font-heading text-2xl font-bold text-[#3D2035]">
          {mode === "create" ? "Nuevo producto" : "Editar producto"}
        </h1>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#3D2035]">
              Nombre <span className="text-[#D4537E]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Labial Mate Rojo Intenso"
              className={inputClass}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#3D2035]">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describí el producto..."
              rows={4}
              className={inputClass + " resize-none"}
            />
          </div>

          {/* Price */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#3D2035]">
              Precio <span className="text-[#D4537E]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#9C6B85]">
                $
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className={inputClass + " pl-8"}
              />
            </div>
            {errors.price && (
              <p className="mt-1.5 text-xs text-red-400">{errors.price}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#3D2035]">
              {mode === "create" ? "Stock inicial" : "Ajustar stock"}
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              min="0"
              className={inputClass}
            />
            {errors.stock && (
              <p className="mt-1.5 text-xs text-red-400">{errors.stock}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#3D2035]">
              Categoría <span className="text-[#D4537E]">*</span>
            </label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className={inputClass + " cursor-pointer"}
            >
              <option value="">Seleccionar categoría...</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1.5 text-xs text-red-400">{errors.category}</p>
            )}
          </div>

          {/* Colors */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#3D2035]">
              Colores del Producto <span className="text-[#D4537E]">*</span>
            </label>
            <div className="space-y-3">
              {colors.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={color.name}
                    disabled={color.name === "Consultar"}
                    onChange={(e) => {
                      const newColors = [...colors];
                      newColors[index] = { name: e.target.value };
                      setColors(newColors);
                    }}
                    placeholder="Nombre del color (ej: 1, 2, Beige claro)"
                    className={
                      inputClass +
                      (color.name === "Consultar"
                        ? " bg-[#FFF0F5]/50 cursor-not-allowed opacity-75 border-[#F2C4D8]"
                        : "")
                    }
                  />
                  {color.name !== "Consultar" && (
                    <button
                      type="button"
                      onClick={() => {
                        setColors(colors.filter((_, i) => i !== index));
                      }}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Eliminar color"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => {
                  setColors([...colors, { name: "" }]);
                }}
                className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-[#D4537E] bg-[#FFF0F5]/30 px-4 py-2.5 text-sm font-medium text-[#D4537E] hover:bg-[#FFF0F5]/60 transition-colors"
              >
                + Agregar color
              </button>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#3D2035]">
              Imágenes <span className="text-[#D4537E]">*</span>
              <span className="ml-2 text-xs font-normal text-[#9C6B85]">
                (máximo 4)
              </span>
            </label>

            {/* Existing images */}
            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="mb-4 grid grid-cols-4 gap-3">
                {existingImages.map((url, i) => (
                  <div key={`existing-${i}`} className="group relative">
                    <img
                      src={url}
                      alt={`Imagen ${i + 1}`}
                      className="h-24 w-full rounded-xl object-cover ring-1 ring-[#F2C4D8]/50"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-400 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {newImages.map((img, i) => (
                  <div key={`new-${i}`} className="group relative">
                    <img
                      src={img.preview}
                      alt={`Nueva imagen ${i + 1}`}
                      className="h-24 w-full rounded-xl object-cover ring-1 ring-[#F2C4D8]/50"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-400 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload area */}
            {totalImages < 4 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 text-sm transition-all duration-200",
                  isDragging
                    ? "border-[#D4537E] bg-[#D4537E]/5 shadow-inner"
                    : "border-[#F2C4D8] bg-[#FFF0F5]/50 text-[#9C6B85] hover:border-[#D4537E] hover:bg-[#FFF0F5]"
                )}
              >
                <Upload
                  className={cn(
                    "h-8 w-8 transition-colors",
                    isDragging ? "text-[#D4537E]" : "text-[#D4537E]/60"
                  )}
                />
                <span className={isDragging ? "text-[#D4537E] font-medium" : ""}>
                  Subir imágenes ({totalImages}/4)
                </span>
                <span
                  className={cn(
                    "text-xs",
                    isDragging ? "text-[#D4537E]/80" : "text-[#9C6B85]/60"
                  )}
                >
                  Arrastrá imágenes aquí o click para seleccionar
                </span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {errors.images && (
              <p className="mt-1.5 text-xs text-red-400">{errors.images}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-[#D4537E] px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#B83A6A] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : mode === "create" ? (
              "Guardar producto"
            ) : (
              "Guardar cambios"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/productos")}
            className="rounded-xl border border-[#F2C4D8] bg-white px-6 py-3 text-sm font-medium text-[#9C6B85] transition-colors hover:bg-[#FFF0F5]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </motion.form>
  );
}
