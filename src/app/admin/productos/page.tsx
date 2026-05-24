"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, ImageIcon, PackageOpen } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";

interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: { _id: string; name: string; slug: string } | null;
  images: { url: string; alt?: string; isPrimary: boolean }[];
  isActive: boolean;
  createdAt: string;
}

export default function AdminProductosPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/productos");
      setProducts(res.data.data);
    } catch {
      showToast("Error al cargar los productos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await api.delete(`/admin/productos/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showToast("Producto eliminado correctamente", "success");
    } catch {
      showToast("Error al eliminar el producto", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4537E] border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#3D2035]">Productos</h1>
          <p className="mt-1 text-sm text-[#9C6B85]">
            {products.length} producto{products.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 rounded-xl bg-[#D4537E] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-[#B83A6A] hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Link>
      </div>

      {/* Content */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-sm">
          <PackageOpen className="h-16 w-16 text-[#F2C4D8]" />
          <p className="mt-4 text-lg font-medium text-[#3D2035]">No hay productos aún</p>
          <Link
            href="/admin/productos/nuevo"
            className="mt-3 text-sm font-medium text-[#D4537E] hover:underline"
          >
            Crear uno →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[#F2C4D8]/40">
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#9C6B85] md:table-cell">
                    Imagen
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#9C6B85]">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#9C6B85]">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#9C6B85]">
                    Precio
                  </th>
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#9C6B85] md:table-cell">
                    N° imágenes
                  </th>
                  <th className="sticky right-0 z-10 bg-white px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#9C6B85] shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.1)]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2C4D8]/20">
                {products.map((product, index) => {
                  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

                  return (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="transition-colors hover:bg-[#FFF0F5]/50"
                    >
                      <td className="hidden px-6 py-4 md:table-cell">
                        {primaryImage ? (
                          <img
                            src={primaryImage.url}
                            alt={product.name}
                            className="h-[50px] w-[50px] rounded-lg object-cover ring-1 ring-[#F2C4D8]/50"
                          />
                        ) : (
                          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-lg bg-[#FFF0F5]">
                            <ImageIcon className="h-5 w-5 text-[#F2C4D8]" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-[#3D2035]">{product.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-[#FFF0F5] px-3 py-1 text-xs font-medium text-[#D4537E]">
                          {product.category?.name || "Sin categoría"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#3D2035]">
                        {formatPrice(product.price)}
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-[#9C6B85] md:table-cell">
                        {product.images.length}
                      </td>
                      <td className="sticky right-0 z-10 bg-white/80 px-6 py-4 backdrop-blur-sm shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.1)] group-hover:bg-white transition-colors duration-200">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/productos/${product._id}/editar`)}
                            className="flex items-center gap-1.5 rounded-lg bg-[#D4537E]/10 px-3 py-1.5 text-xs font-medium text-[#D4537E] transition-colors hover:bg-[#D4537E]/20"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-100 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
