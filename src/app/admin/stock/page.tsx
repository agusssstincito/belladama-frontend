"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Hourglass, Plus, Check, X } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface StockProduct {
  _id: string;
  name: string;
  images: { url: string }[];
  stock: number;
  reservedStock: number;
  stockDisponible: number;
}

export default function AdminStockPage() {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addQuantity, setAddQuantity] = useState<string>("");
  const { showToast } = useToast();

  const fetchStock = async () => {
    try {
      const response = await api.get("/admin/stock");
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching stock:", error);
      showToast("Error al cargar el stock", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleAddStock = async (id: string) => {
    const quantity = parseInt(addQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      showToast("Ingresá una cantidad válida", "error");
      return;
    }

    try {
      await api.put(`/admin/stock/${id}`, { quantity });
      showToast("Stock actualizado", "success");
      setEditingId(null);
      setAddQuantity("");
      fetchStock();
    } catch (error) {
      console.error("Error updating stock:", error);
      showToast("Error al actualizar stock", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-[#3D2035]">
          Gestión de Stock
        </h1>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#F2C4D8]/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#F2C4D8]/50 bg-[#FFF0F5]/50 text-[#9C6B85]">
                <th className="px-6 py-4 font-medium">Producto</th>
                <th className="px-6 py-4 font-medium">Stock real</th>
                <th className="px-6 py-4 font-medium">Reservado</th>
                <th className="px-6 py-4 font-medium">Disponible</th>
                <th className="px-6 py-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2C4D8]/20">
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="transition-colors hover:bg-[#FFF0F5]/30"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#FFF0F5]">
                        <img
                          src={product.images[0]?.url || "/placeholder.jpg"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="font-medium text-[#3D2035]">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#3D2035]">{product.stock}</td>
                  <td className="px-6 py-4 text-[#3D2035]">
                    <div className="flex items-center gap-1.5 text-orange-500">
                      <Hourglass className="h-4 w-4" />
                      <span>{Math.max(0, product.reservedStock)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {Math.max(0, product.stockDisponible) === 0 ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                        Sin stock
                      </span>
                    ) : Math.max(0, product.stockDisponible) <= 5 ? (
                      <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
                        {Math.max(0, product.stockDisponible)}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                        {Math.max(0, product.stockDisponible)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === product._id ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          value={addQuantity}
                          onChange={(e) => setAddQuantity(e.target.value)}
                          placeholder="+"
                          className="w-16 rounded-lg border border-[#F2C4D8] px-2 py-1 text-sm text-[#3D2035] outline-none focus:border-[#D4537E]"
                          min="1"
                        />
                        <button
                          onClick={() => handleAddStock(product._id)}
                          className="rounded-lg bg-[#D4537E] p-1.5 text-white hover:bg-[#B83A6A]"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setAddQuantity("");
                          }}
                          className="rounded-lg bg-gray-200 p-1.5 text-gray-600 hover:bg-gray-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingId(product._id)}
                        className="inline-flex items-center justify-center rounded-lg border border-[#F2C4D8] bg-white p-2 text-[#D4537E] transition-colors hover:bg-[#FFF0F5]"
                        title="Agregar stock"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#9C6B85]">
                    No hay productos en el sistema
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
