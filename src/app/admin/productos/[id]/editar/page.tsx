"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import ProductForm from "@/components/admin/ProductForm";

export default function EditarProductoPage() {
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/admin/productos/${params.id}`);
        setProduct(res.data.data);
      } catch {
        setError("No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4537E] border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-red-400">{error || "Producto no encontrado"}</p>
      </div>
    );
  }

  return <ProductForm mode="edit" initialData={product} />;
}
