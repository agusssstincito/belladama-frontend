"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Megaphone, Check, X, Search, Tag, Percent, Calendar, Ticket } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface Announcement {
  _id: string;
  message: string;
  isActive: boolean;
  createdAt: string;
}

interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minCartTotal: number;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function OfertasPage() {
  const [activeTab, setActiveTab] = useState<'announcements' | 'discounts' | 'coupons' | 'category-discounts' | 'store-discounts' | 'quantity-discounts'>('announcements');
  const { showToast } = useToast();

  // Announcement states
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annMessage, setAnnMessage] = useState("");
  const [annActive, setAnnActive] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [isAnnLoading, setIsAnnLoading] = useState(false);

  // Discount states
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Coupon states
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    minCartTotal: 0,
    expiresAt: "",
    maxUses: "" as string | number,
  });

  // Store Discount states
  const [categories, setCategories] = useState<any[]>([]);
  const [storeDiscounts, setStoreDiscounts] = useState<any[]>([]);
  const [isStoreDiscountLoading, setIsStoreDiscountLoading] = useState(false);
  const [newStoreDiscount, setNewStoreDiscount] = useState({
    type: "category" as "category" | "store",
    categoryId: "",
    discountType: "percentage" as "percentage" | "fixed",
    value: 0,
    isActive: false,
    isPermanent: true,
    expiresAt: ""
  });
  
  // Quantity Discount states
  const [qtyDiscounts, setQtyDiscounts] = useState<any[]>([]);
  const [isQtyLoading, setIsQtyLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newQtyDiscount, setNewQtyDiscount] = useState({
    scope: "product" as "product" | "category" | "store",
    productId: "",
    categoryId: "",
    minQuantity: 2,
    discountType: "percentage" as "percentage" | "fixed",
    value: 0
  });

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get("/announcements");
      if (response.data.success) {
        setAnnouncements(response.data.data);
      }
    } catch (error) {
      showToast("Error al cargar anuncios", "error");
    }
  };

  const fetchProducts = async (search = "") => {
    setIsSearching(true);
    try {
      const response = await api.get(`/products?search=${search}&limit=20`);
      const prodList = response.data.data?.products || response.data.products || [];
      setProducts(prodList);
    } catch (error) {
      showToast("Error al cargar productos", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await api.get("/coupons");
      if (response.data.success) {
        setCoupons(response.data.data);
      }
    } catch (error) {
      showToast("Error al cargar cupones", "error");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      showToast("Error al cargar categorías", "error");
    }
  };

  const fetchStoreDiscounts = async () => {
    setIsStoreDiscountLoading(true);
    try {
      const response = await api.get("/store-discounts");
      if (response.data.success) {
        setStoreDiscounts(response.data.data);
      }
    } catch (error) {
      showToast("Error al cargar descuentos globales", "error");
    } finally {
      setIsStoreDiscountLoading(false);
    }
  };

  const fetchQtyDiscounts = async () => {
    try {
      const response = await api.get("/quantity-discounts");
      if (response.data.success) {
        setQtyDiscounts(response.data.data);
      }
    } catch (error) {
      showToast("Error al cargar descuentos por cantidad", "error");
    }
  };

  useEffect(() => {
    if (activeTab === 'announcements') {
      fetchAnnouncements();
    } else if (activeTab === 'discounts') {
      fetchProducts(searchQuery);
    } else if (activeTab === 'coupons') {
      fetchCoupons();
    } else if (activeTab === 'category-discounts' || activeTab === 'store-discounts') {
      fetchCategories();
      fetchStoreDiscounts();
    } else if (activeTab === 'quantity-discounts') {
      fetchCategories();
      fetchQtyDiscounts();
      fetchProducts(""); // Preload some products
    }
  }, [activeTab]);

  // Announcement Handlers
  const handleAnnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annMessage.trim()) return;

    setIsAnnLoading(true);
    try {
      if (editingAnnId) {
        await api.put(`/announcements/${editingAnnId}`, { message: annMessage, isActive: annActive });
        showToast("Anuncio actualizado", "success");
      } else {
        await api.post("/announcements", { message: annMessage, isActive: annActive });
        showToast("Anuncio creado", "success");
      }
      setAnnMessage("");
      setAnnActive(false);
      setEditingAnnId(null);
      fetchAnnouncements();
    } catch (error) {
      showToast("Error al guardar anuncio", "error");
    } finally {
      setIsAnnLoading(false);
    }
  };

  const handleEditAnn = (ann: Announcement) => {
    setEditingAnnId(ann._id);
    setAnnMessage(ann.message);
    setAnnActive(ann.isActive);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteAnn = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este anuncio?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      showToast("Anuncio eliminado", "success");
      fetchAnnouncements();
    } catch (error) {
      showToast("Error al eliminar anuncio", "error");
    }
  };

  const handleToggleAnn = async (ann: Announcement) => {
    try {
      await api.put(`/announcements/${ann._id}`, { ...ann, isActive: !ann.isActive });
      fetchAnnouncements();
      showToast(ann.isActive ? "Anuncio desactivado" : "Anuncio activado", "success");
    } catch (error) {
      showToast("Error al cambiar estado", "error");
    }
  };

  // Discount Handlers
  const handleUpdateDiscount = async (productId: string, salePrice: number | null, saleEndsAt: string | null) => {
    setUpdatingId(productId);
    console.log('FRONTEND: Updating discount for', productId);
    console.log('FRONTEND: Body being sent:', { salePrice, saleEndsAt });
    try {
      await api.put(`/admin/productos/${productId}`, {
        salePrice: salePrice || null,
        saleEndsAt: saleEndsAt || null
      });
      showToast("Descuento actualizado", "success");
      fetchProducts(searchQuery);
    } catch (error) {
      showToast("Error al actualizar descuento", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Coupon Handlers
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCouponLoading(true);
    try {
      const data = {
        ...newCoupon,
        maxUses: newCoupon.maxUses === "" ? null : Number(newCoupon.maxUses),
        expiresAt: newCoupon.expiresAt === "" ? null : newCoupon.expiresAt,
      };
      await api.post("/coupons", data);
      showToast("Cupón creado con éxito", "success");
      setNewCoupon({
        code: "",
        type: "percentage",
        value: 0,
        minCartTotal: 0,
        expiresAt: "",
        maxUses: "",
      });
      fetchCoupons();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Error al crear cupón", "error");
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cupón?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      showToast("Cupón eliminado", "success");
      fetchCoupons();
    } catch (error) {
      showToast("Error al eliminar cupón", "error");
    }
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      fetchCoupons();
      showToast(coupon.isActive ? "Cupón desactivado" : "Cupón activado", "success");
    } catch (error) {
      showToast("Error al cambiar estado", "error");
    }
  };

  // Store Discount Handlers
  const handleStoreDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'store-discounts') {
      newStoreDiscount.type = 'store';
      newStoreDiscount.categoryId = '';
    } else {
       newStoreDiscount.type = 'category';
    }

    if (newStoreDiscount.type === 'category' && !newStoreDiscount.categoryId) {
      showToast("Seleccioná una categoría", "error");
      return;
    }

    setIsStoreDiscountLoading(true);
    try {
      const payload = {
        ...newStoreDiscount,
        isActive: newStoreDiscount.isPermanent ? false : true,
        expiresAt: newStoreDiscount.isPermanent ? null : newStoreDiscount.expiresAt
      };
      await api.post("/store-discounts", payload);
      showToast("Descuento guardado correctamente", "success");
      fetchStoreDiscounts();
      setNewStoreDiscount({ ...newStoreDiscount, value: 0, categoryId: "", expiresAt: "", isPermanent: true });
    } catch (error: any) {
      showToast(error.response?.data?.message || "Error al aplicar descuento", "error");
    } finally {
      setIsStoreDiscountLoading(false);
    }
  };

  const handleDeleteStoreDiscount = async (id: string) => {
    if (!confirm("¿Estás seguro de quitar este descuento?")) return;
    try {
      await api.delete(`/store-discounts/${id}`);
      showToast("Descuento eliminado", "success");
      fetchStoreDiscounts();
    } catch (error) {
      showToast("Error al eliminar descuento", "error");
    }
  };

  const handleToggleStoreDiscount = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/store-discounts/${id}`, { isActive: !currentStatus });
      fetchStoreDiscounts();
      showToast(!currentStatus ? "Descuento activado" : "Descuento desactivado", "success");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Error al cambiar estado", "error");
    }
  };

  // Quantity Discount Handlers
  const handleQtyDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsQtyLoading(true);
    try {
      const data = {
        ...newQtyDiscount,
        productId: newQtyDiscount.scope === 'product' ? selectedProduct?._id || selectedProduct?.id : undefined,
      };
      await api.post("/quantity-discounts", data);
      showToast("Descuento por cantidad creado", "success");
      setNewQtyDiscount({
        scope: "product",
        productId: "",
        categoryId: "",
        minQuantity: 2,
        discountType: "percentage",
        value: 0
      });
      setSelectedProduct(null);
      setProductSearch("");
      fetchQtyDiscounts();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Error al crear descuento", "error");
    } finally {
      setIsQtyLoading(false);
    }
  };

  const handleDeleteQtyDiscount = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este descuento?")) return;
    try {
      await api.delete(`/quantity-discounts/${id}`);
      showToast("Descuento eliminado", "success");
      fetchQtyDiscounts();
    } catch (error) {
      showToast("Error al eliminar descuento", "error");
    }
  };

  const handleToggleQtyDiscount = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/quantity-discounts/${id}`, { isActive: !currentStatus });
      fetchQtyDiscounts();
      showToast(!currentStatus ? "Descuento activado" : "Descuento desactivado", "success");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Error al cambiar estado", "error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-8">
        <Percent className="h-8 w-8 text-[#D4537E]" />
        <h1 className="text-3xl font-heading font-bold text-[#3D2035]">Ofertas y Descuentos</h1>
      </div>

      <div className="flex border-b border-[#D4537E]/20 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('announcements')}
          className={cn(
            "px-6 py-3 border-b-2 font-medium transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'announcements' ? "border-[#D4537E] text-[#D4537E]" : "border-transparent text-[#3D2035]/50 hover:text-[#3D2035]"
          )}
        >
          <Megaphone className="h-4 w-4" />
          Anuncios
        </button>
        <button 
          onClick={() => setActiveTab('discounts')}
          className={cn(
            "px-6 py-3 border-b-2 font-medium transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'discounts' ? "border-[#D4537E] text-[#D4537E]" : "border-transparent text-[#3D2035]/50 hover:text-[#3D2035]"
          )}
        >
          <Tag className="h-4 w-4" />
          Descuentos
        </button>
        <button 
          onClick={() => setActiveTab('coupons')}
          className={cn(
            "px-6 py-3 border-b-2 font-medium transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'coupons' ? "border-[#D4537E] text-[#D4537E]" : "border-transparent text-[#3D2035]/50 hover:text-[#3D2035]"
          )}
        >
          <Ticket className="h-4 w-4" />
          Cupones
        </button>
        <button 
          onClick={() => setActiveTab('category-discounts')}
          className={cn(
            "px-6 py-3 border-b-2 font-medium transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'category-discounts' ? "border-[#D4537E] text-[#D4537E]" : "border-transparent text-[#3D2035]/50 hover:text-[#3D2035]"
          )}
        >
          <Search className="h-4 w-4" />
          Por Categoría
        </button>
        <button 
          onClick={() => setActiveTab('store-discounts')}
          className={cn(
            "px-6 py-3 border-b-2 font-medium transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'store-discounts' ? "border-[#D4537E] text-[#D4537E]" : "border-transparent text-[#3D2035]/50 hover:text-[#3D2035]"
          )}
        >
          <Tag className="h-4 w-4" />
          Toda la tienda
        </button>
        <button 
          onClick={() => setActiveTab('quantity-discounts')}
          className={cn(
            "px-6 py-3 border-b-2 font-medium transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'quantity-discounts' ? "border-[#D4537E] text-[#D4537E]" : "border-transparent text-[#3D2035]/50 hover:text-[#3D2035]"
          )}
        >
          <Plus className="h-4 w-4" />
          Por Cantidad
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'announcements' ? (
          <motion.div
            key="ann-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Form */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-[#D4537E]/10">
              <h2 className="text-xl font-heading font-bold text-[#3D2035] mb-6">
                {editingAnnId ? "Editar Anuncio" : "Nuevo Anuncio"}
              </h2>
              <form onSubmit={handleAnnSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Mensaje del anuncio</label>
                  <textarea
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    placeholder="Ej: ¡20% OFF en toda la tienda este fin de semana! 💄"
                    className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 font-body focus:border-[#D4537E] focus:outline-none min-h-[100px]"
                    required
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-[#FFF0F5]/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", annActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400")}>
                      {annActive ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-[#3D2035] text-sm">Estado del anuncio</p>
                      <p className="text-[10px] text-[#3D2035]/60">Solo puede haber uno activo</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnnActive(!annActive)}
                    className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors", annActive ? "bg-[#D4537E]" : "bg-gray-200")}
                  >
                    <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", annActive ? "translate-x-6" : "translate-x-1")} />
                  </button>
                </div>
                <div className="flex gap-4">
                  <Button type="submit" variant="primary" className="flex-1 rounded-2xl" disabled={isAnnLoading}>
                    {isAnnLoading ? "Guardando..." : (editingAnnId ? "Guardar Cambios" : "Crear Anuncio")}
                  </Button>
                  {editingAnnId && (
                    <Button type="button" variant="outline" className="rounded-2xl" onClick={() => { setEditingAnnId(null); setAnnMessage(""); setAnnActive(false); }}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* List */}
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-bold text-[#3D2035] mb-6">Anuncios Guardados</h2>
              {announcements.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-12 text-center border border-dashed border-[#D4537E]/20">
                  <Megaphone className="h-12 w-12 text-[#D4537E]/20 mx-auto mb-4" />
                  <p className="text-[#3D2035]/50">No hay anuncios creados todavía.</p>
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann._id} className={cn("bg-white p-6 rounded-[2rem] border transition-all flex items-center justify-between gap-4", ann.isActive ? "border-[#D4537E] shadow-soft" : "border-[#D4537E]/10")}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {ann.isActive && <span className="px-2 py-0.5 bg-[#D4537E] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Activo</span>}
                        <span className="text-xs text-[#3D2035]/40 italic">{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[#3D2035] font-medium">{ann.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleAnn(ann)} className={cn("p-2 rounded-xl border transition-colors", ann.isActive ? "bg-green-50 border-green-100 text-green-600 hover:bg-green-100" : "bg-[#FFF0F5] border-[#FFF0F5] text-[#D4537E] hover:bg-[#FFF0F5]/80")}>
                        {ann.isActive ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                      </button>
                      <button onClick={() => handleEditAnn(ann)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-50"><Edit2 className="h-5 w-5" /></button>
                      <button onClick={() => handleDeleteAnn(ann._id)} className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-50"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : activeTab === 'discounts' ? (
          <motion.div
            key="disc-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#3D2035]/30" />
              <input
                type="text"
                placeholder="Buscar producto por nombre..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  const timer = setTimeout(() => fetchProducts(e.target.value), 500);
                  return () => clearTimeout(timer);
                }}
                className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border-2 border-[#FFF0F5] bg-white focus:border-[#D4537E] focus:outline-none shadow-sm"
              />
            </div>

            <div className="bg-white rounded-[2.5rem] overflow-hidden border border-[#D4537E]/10 shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#FFF0F5]/50 text-[#3D2035]/60 text-xs font-heading font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Producto</th>
                      <th className="px-6 py-4">Precio Base</th>
                      <th className="px-6 py-4">Precio Oferta</th>
                      <th className="px-6 py-4">Vence</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FFF0F5]">
                    {products.map((prod) => (
                      <ProductRow 
                        key={prod._id || prod.id} 
                        product={prod} 
                        onSave={handleUpdateDiscount}
                        isUpdating={updatingId === (prod._id || prod.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'coupons' ? (
          <motion.div
            key="coupon-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Form */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-[#D4537E]/10">
              <h2 className="text-xl font-heading font-bold text-[#3D2035] mb-6 flex items-center gap-2">
                <Plus className="h-5 w-5" /> Nuevo Cupón
              </h2>
              <form onSubmit={handleCouponSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Código del cupón (Único)</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="Ej: BIENVENIDA20"
                    className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 font-bold focus:border-[#D4537E] focus:outline-none uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Tipo de descuento</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as any })}
                    className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Valor del descuento</label>
                  <input
                    type="number"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                    className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Compra mínima ($)</label>
                  <input
                    type="number"
                    value={newCoupon.minCartTotal}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minCartTotal: Number(e.target.value) })}
                    className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Máximo de usos (Opcional)</label>
                  <input
                    type="number"
                    value={newCoupon.maxUses}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                    className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                    placeholder="Sin límite"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Vencimiento (Opcional)</label>
                  <input
                    type="date"
                    value={newCoupon.expiresAt}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                    className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                  />
                </div>
                <div className="md:pt-7">
                  <Button type="submit" variant="primary" className="w-full rounded-2xl" disabled={isCouponLoading}>
                    {isCouponLoading ? "Creando..." : "Crear Cupón"}
                  </Button>
                </div>
              </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden border border-[#D4537E]/10 shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#FFF0F5]/50 text-[#3D2035]/60 text-xs font-heading font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Código</th>
                      <th className="px-6 py-4">Descuento</th>
                      <th className="px-6 py-4">Usos</th>
                      <th className="px-6 py-4">Vencimiento</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FFF0F5]">
                    {coupons.map((coupon) => (
                      <tr key={coupon._id} className={cn("hover:bg-[#FFF9FB] transition-colors", !coupon.isActive && "opacity-50")}>
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#3D2035]">{coupon.code}</p>
                          <p className="text-[10px] text-[#3D2035]/50">Mín: {formatPrice(coupon.minCartTotal)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-[#FFF0F5] text-[#D4537E] border border-[#D4537E]/20 rounded-full font-bold text-xs">
                            {coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#3D2035]/70">
                            {coupon.usedCount} / {coupon.maxUses || "∞"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#3D2035]/70">
                            {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Nunca'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleCoupon(coupon)}
                              className={cn("p-2 rounded-xl border transition-colors", coupon.isActive ? "bg-green-50 text-green-600 border-green-50" : "bg-gray-50 text-gray-400 border-gray-50")}
                            >
                              {coupon.isActive ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4 rotate-45" />}
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon._id)}
                              className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-50 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-[#3D2035]/50">No hay cupones creados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'category-discounts' ? (
          <motion.div
            key="cat-disc-tab"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-[#D4537E]/10">
              <h2 className="text-xl font-heading font-bold text-[#3D2035] mb-6 flex items-center gap-2">
                <Plus className="h-5 w-5" /> Descuento por Categoría
              </h2>
              <form onSubmit={handleStoreDiscountSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Categoría</label>
                  <select
                    value={newStoreDiscount.categoryId}
                    onChange={(e) => setNewStoreDiscount({ ...newStoreDiscount, categoryId: e.target.value })}
                    className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Tipo</label>
                    <select
                      value={newStoreDiscount.discountType}
                      onChange={(e) => setNewStoreDiscount({ ...newStoreDiscount, discountType: e.target.value as any })}
                      className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                    >
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Monto ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Valor</label>
                    <input
                      type="number"
                      value={newStoreDiscount.value}
                      onChange={(e) => setNewStoreDiscount({ ...newStoreDiscount, value: Number(e.target.value) })}
                      className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                      required
                      min="0"
                    />
                  </div>
                </div>
                {/* Duration settings for category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-4">
                   <div>
                    <label className="block text-sm font-medium text-[#3D2035]/70 mb-3">Duración</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={newStoreDiscount.isPermanent} 
                          onChange={() => setNewStoreDiscount({...newStoreDiscount, isPermanent: true, expiresAt: ""})}
                          className="w-4 h-4 text-[#D4537E] focus:ring-[#D4537E]"
                        />
                        <span className="text-sm text-[#3D2035]/70">Permanente</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={!newStoreDiscount.isPermanent} 
                          onChange={() => setNewStoreDiscount({...newStoreDiscount, isPermanent: false})}
                          className="w-4 h-4 text-[#D4537E] focus:ring-[#D4537E]"
                        />
                        <span className="text-sm text-[#3D2035]/70">Fecha límite</span>
                      </label>
                    </div>
                  </div>
                  {!newStoreDiscount.isPermanent && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                       <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Vence el día</label>
                       <input
                        type="date"
                        value={newStoreDiscount.expiresAt}
                        onChange={(e) => setNewStoreDiscount({ ...newStoreDiscount, expiresAt: e.target.value })}
                        className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                        required={!newStoreDiscount.isPermanent}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                   <Button type="submit" variant="primary" className="w-full rounded-2xl" disabled={isStoreDiscountLoading}>
                    {isStoreDiscountLoading ? "Aplicando..." : "Aplicar descuento"}
                  </Button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-[2.5rem] overflow-hidden border border-[#D4537E]/10 shadow-soft">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#FFF0F5]/50 text-[#3D2035]/60 text-xs font-heading font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Descuento</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFF0F5]">
                  {storeDiscounts.filter(d => d.type === 'category').map((disc) => {
                    const isExpired = disc.expiresAt && new Date(disc.expiresAt) < new Date();
                    const isPermanent = !disc.expiresAt;
                    return (
                      <tr key={disc._id} className={cn("hover:bg-[#FFF9FB] transition-colors", (!disc.isActive || isExpired) && "opacity-50")}>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                               <p className="font-bold text-[#3D2035]">{disc.categoryId?.name || 'Categoría eliminada'}</p>
                               {disc.isActive && !isExpired && <span className="px-2 py-0.5 bg-[#D4537E] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Activo</span>}
                               {isExpired && <span className="px-2 py-0.5 bg-gray-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Vencido</span>}
                            </div>
                            {disc.expiresAt && (
                              <p className="text-[10px] text-[#3D2035]/50 mt-1">
                                Vence: {new Date(disc.expiresAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-[#FFF0F5] text-[#D4537E] border border-[#D4537E]/20 rounded-full font-bold text-xs">
                            {disc.discountType === 'percentage' ? `${disc.value}%` : formatPrice(disc.value)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                            {isPermanent && !isExpired && (
                              <button
                                onClick={() => handleToggleStoreDiscount(disc._id, disc.isActive)}
                                className={cn("p-2 rounded-xl border transition-colors", disc.isActive ? "bg-green-50 text-green-600 border-green-50" : "bg-gray-50 text-gray-400 border-gray-50")}
                              >
                                {disc.isActive ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4 rotate-45" />}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteStoreDiscount(disc._id)}
                              className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-50 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {storeDiscounts.filter(d => d.type === 'category').length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-[#3D2035]/50">No hay descuentos por categoría.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : activeTab === 'store-discounts' ? (
          <motion.div
            key="store-disc-tab"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-[#D4537E]/10">
              <h2 className="text-xl font-heading font-bold text-[#3D2035] mb-6">Descuento Toda la Tienda</h2>
              <form onSubmit={handleStoreDiscountSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Tipo</label>
                    <select
                      value={newStoreDiscount.discountType}
                      onChange={(e) => setNewStoreDiscount({ ...newStoreDiscount, discountType: e.target.value as any })}
                      className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                    >
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Monto ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Valor</label>
                    <input
                      type="number"
                      value={newStoreDiscount.value}
                      onChange={(e) => setNewStoreDiscount({ ...newStoreDiscount, value: Number(e.target.value) })}
                      className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                      required
                      min="0"
                    />
                  </div>
                </div>
                {/* Duration settings for store */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-4">
                   <div>
                    <label className="block text-sm font-medium text-[#3D2035]/70 mb-3">Duración</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={newStoreDiscount.isPermanent} 
                          onChange={() => setNewStoreDiscount({...newStoreDiscount, isPermanent: true, expiresAt: ""})}
                          className="w-4 h-4 text-[#D4537E] focus:ring-[#D4537E]"
                        />
                        <span className="text-sm text-[#3D2035]/70">Permanente</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={!newStoreDiscount.isPermanent} 
                          onChange={() => setNewStoreDiscount({...newStoreDiscount, isPermanent: false})}
                          className="w-4 h-4 text-[#D4537E] focus:ring-[#D4537E]"
                        />
                        <span className="text-sm text-[#3D2035]/70">Fecha límite</span>
                      </label>
                    </div>
                  </div>
                  {!newStoreDiscount.isPermanent && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                       <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Vence el día</label>
                       <input
                        type="date"
                        value={newStoreDiscount.expiresAt}
                        onChange={(e) => setNewStoreDiscount({ ...newStoreDiscount, expiresAt: e.target.value })}
                        className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                        required={!newStoreDiscount.isPermanent}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}
                </div>
                <div className="md:pt-7">
                   <Button type="submit" variant="primary" className="w-full rounded-2xl" disabled={isStoreDiscountLoading}>
                    {isStoreDiscountLoading ? "Aplicando..." : "Aplicar a todo"}
                  </Button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-[2.5rem] overflow-hidden border border-[#D4537E]/10 shadow-soft">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#FFF0F5]/50 text-[#3D2035]/60 text-xs font-heading font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Descuento</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFF0F5]">
                  {storeDiscounts.filter(d => d.type === 'store').map((disc) => {
                    const isExpired = disc.expiresAt && new Date(disc.expiresAt) < new Date();
                    const isPermanent = !disc.expiresAt;
                    return (
                      <tr key={disc._id} className={cn("hover:bg-[#FFF9FB] transition-colors", (!disc.isActive || isExpired) && "opacity-50")}>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <div className="flex items-center gap-2">
                               <p className="font-bold text-[#3D2035]">General de tienda</p>
                               {disc.isActive && !isExpired && <span className="px-2 py-0.5 bg-[#D4537E] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Activo</span>}
                               {isExpired && <span className="px-2 py-0.5 bg-gray-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Vencido</span>}
                            </div>
                            {disc.expiresAt && (
                              <p className="text-[10px] text-[#3D2035]/50 mt-1">
                                Vence: {new Date(disc.expiresAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-[#FFF0F5] text-[#D4537E] border border-[#D4537E]/20 rounded-full font-bold text-xs">
                            {disc.discountType === 'percentage' ? `${disc.value}%` : formatPrice(disc.value)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                            {isPermanent && !isExpired && (
                              <button
                                onClick={() => handleToggleStoreDiscount(disc._id, disc.isActive)}
                                className={cn("p-2 rounded-xl border transition-colors", disc.isActive ? "bg-green-50 text-green-600 border-green-50" : "bg-gray-50 text-gray-400 border-gray-50")}
                              >
                                {disc.isActive ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4 rotate-45" />}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteStoreDiscount(disc._id)}
                              className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-50 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {storeDiscounts.filter(d => d.type === 'store').length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-[#3D2035]/50">No hay descuentos generales creados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="qty-disc-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Quantity Discount Form */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-[#D4537E]/10">
              <h2 className="text-xl font-heading font-bold text-[#3D2035] mb-6 flex items-center gap-2">
                <Plus className="h-5 w-5" /> Nuevo Descuento por Cantidad
              </h2>
              <form onSubmit={handleQtyDiscountSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Alcance</label>
                  <select
                    value={newQtyDiscount.scope}
                    onChange={(e) => {
                      setNewQtyDiscount({ ...newQtyDiscount, scope: e.target.value as any, productId: "", categoryId: "" });
                      setSelectedProduct(null);
                      setProductSearch("");
                    }}
                    className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                  >
                    <option value="product">Producto específico</option>
                    <option value="category">Categoría</option>
                    <option value="store">Toda la tienda</option>
                  </select>
                </div>

                {newQtyDiscount.scope === 'product' && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Producto</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3D2035]/30" />
                      <input
                        type="text"
                        value={selectedProduct ? selectedProduct.name : productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setSelectedProduct(null);
                          fetchProducts(e.target.value);
                        }}
                        placeholder="Buscar producto..."
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] focus:border-[#D4537E] focus:outline-none"
                        required={!selectedProduct}
                      />
                    </div>
                    {productSearch && !selectedProduct && products.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#FFF0F5] rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                        {products.map((p) => (
                          <button
                            key={p._id || p.id}
                            type="button"
                            onClick={() => {
                              setSelectedProduct(p);
                              setProductSearch("");
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-[#FFF0F5] text-sm text-[#3D2035] transition-colors"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedProduct && (
                      <button 
                         type="button"
                         onClick={() => setSelectedProduct(null)}
                         className="absolute right-3 top-[42px] text-[#D4537E] hover:text-[#D4537E]/80"
                      >
                         <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {newQtyDiscount.scope === 'category' && (
                  <div>
                    <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Categoría</label>
                    <select
                      value={newQtyDiscount.categoryId}
                      onChange={(e) => setNewQtyDiscount({ ...newQtyDiscount, categoryId: e.target.value })}
                      className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                      required
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Cantidad mínima</label>
                  <input
                    type="number"
                    value={newQtyDiscount.minQuantity}
                    onChange={(e) => setNewQtyDiscount({ ...newQtyDiscount, minQuantity: Number(e.target.value) })}
                    className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                    min="2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Tipo</label>
                    <select
                      value={newQtyDiscount.discountType}
                      onChange={(e) => setNewQtyDiscount({ ...newQtyDiscount, discountType: e.target.value as any })}
                      className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                    >
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Monto fijo ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3D2035]/70 mb-2">Valor</label>
                    <input
                      type="number"
                      value={newQtyDiscount.value}
                      onChange={(e) => setNewQtyDiscount({ ...newQtyDiscount, value: Number(e.target.value) })}
                      className="w-full rounded-2xl border-2 border-[#FFF0F5] bg-[#FFF9FB] px-4 py-3 focus:border-[#D4537E] focus:outline-none"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                  <Button type="submit" variant="primary" className="w-full rounded-2xl" disabled={isQtyLoading}>
                    {isQtyLoading ? "Guardando..." : "Crear Descuento"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Quantity Discount List */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden border border-[#D4537E]/10 shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#FFF0F5]/50 text-[#3D2035]/60 text-xs font-heading font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Alcance / Objetivo</th>
                      <th className="px-6 py-4">Cant. Mínima</th>
                      <th className="px-6 py-4">Descuento</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FFF0F5]">
                    {qtyDiscounts.map((disc) => (
                      <tr key={disc._id} className={cn("hover:bg-[#FFF9FB] transition-colors", !disc.isActive && "opacity-50")}>
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#3D2035]">
                            {disc.scope === 'product' ? 'Producto' : disc.scope === 'category' ? 'Categoría' : 'Toda la tienda'}
                          </p>
                          <p className="text-[10px] text-[#3D2035]/60">
                            {disc.scope === 'product' ? disc.productId?.name : disc.scope === 'category' ? disc.categoryId?.name : 'Global'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#3D2035]">Llevando {disc.minQuantity} o más</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-[#FFF0F5] text-[#D4537E] border border-[#D4537E]/20 rounded-full font-bold text-xs">
                            {disc.discountType === 'percentage' ? `${disc.value}%` : formatPrice(disc.value)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleQtyDiscount(disc._id, disc.isActive)}
                              className={cn("p-2 rounded-xl border transition-colors", disc.isActive ? "bg-green-50 text-green-600 border-green-50" : "bg-gray-50 text-gray-400 border-gray-50")}
                            >
                              {disc.isActive ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4 rotate-45" />}
                            </button>
                            <button
                              onClick={() => handleDeleteQtyDiscount(disc._id)}
                              className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-50 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {qtyDiscounts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-[#3D2035]/50">No hay descuentos por cantidad creados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductRow({ product, onSave, isUpdating }: { product: Product, onSave: any, isUpdating: boolean }) {
  const [salePrice, setSalePrice] = useState<string>(product.salePrice?.toString() || "");
  const [saleEndsAt, setSaleEndsAt] = useState<string>(product.saleEndsAt ? product.saleEndsAt.split('T')[0] : "");

  return (
    <tr className="hover:bg-[#FFF9FB] transition-colors">
      <td className="px-6 py-4">
        <p className="font-bold text-[#3D2035] text-sm">{product.name}</p>
        <p className="text-[10px] text-[#3D2035]/50 font-medium">Categoría: {product.category?.name || 'N/A'}</p>
      </td>
      <td className="px-6 py-4 text-[#3D2035]/70 text-sm font-medium">
        {formatPrice(product.price)}
      </td>
      <td className="px-6 py-4">
        <div className="relative w-28">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#D4537E] font-bold text-xs">$</span>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            className="w-full pl-5 pr-2 py-1.5 rounded-lg bg-[#FFF0F5]/50 border border-[#D4537E]/20 text-sm font-bold text-[#D4537E] focus:outline-none focus:border-[#D4537E]"
            placeholder="0.00"
          />
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-medium">
        <input
          type="date"
          value={saleEndsAt}
          onChange={(e) => setSaleEndsAt(e.target.value)}
          className="rounded-lg bg-[#FFF0F5]/50 border border-[#D4537E]/20 px-2 py-1.5 focus:outline-none focus:border-[#D4537E] text-xs text-[#3D2035]/70"
        />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onSave(product._id || product.id, salePrice ? Number(salePrice) : null, saleEndsAt || null)}
            disabled={isUpdating}
            className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-50"
            title="Guardar oferta"
          >
            {isUpdating ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" /> : <Check className="h-4 w-4" />}
          </button>
          {(product.salePrice || salePrice) && (
            <button
              onClick={() => {
                setSalePrice("");
                setSaleEndsAt("");
                onSave(product._id || product.id, null, null);
              }}
              disabled={isUpdating}
              className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-50"
              title="Quitar oferta"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
