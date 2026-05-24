import { create } from 'zustand';
import api from '@/lib/api';
import type { Product } from '@/types';
import { useAuthStore } from './authStore';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    if (!useAuthStore.getState().isAuthenticated) return;
    
    set({ isLoading: true });
    try {
      const response = await api.get('/wishlist');
      set({ items: response.data.data });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (product: Product) => {
    const { isAuthenticated } = useAuthStore.getState();
    const productId = product._id || product.id;

    if (!isAuthenticated) {
      // Prompt login
      window.location.href = '/login?callback=/products';
      return;
    }

    const currentItems = get().items;
    const isAlreadyIn = currentItems.some(i => (i._id || i.id) === productId);

    // Optimistic Update
    if (isAlreadyIn) {
      set({ items: currentItems.filter(i => (i._id || i.id) !== productId) });
    } else {
      set({ items: [...currentItems, product] });
    }

    try {
      await api.post(`/wishlist/${productId}`);
      // No need to set items from response if we trust the toggle logic, 
      // but we could refresh if needed.
    } catch (error) {
      // Revert on error
      set({ items: currentItems });
      console.error('Error toggling wishlist:', error);
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.some(i => (i._id || i.id) === productId);
  },

  clearWishlist: () => {
    set({ items: [] });
  }
}));