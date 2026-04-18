import { create } from 'zustand';
import axios from 'axios';

const useStore = create((set, get) => ({
    // Global State
    currentProductData: null,
    isLoading: false,
    error: null,
    liveSyncEnabled: true,
    catalog: [], // Maps to Catalog page for historical analysis

    // Actions
    toggleLiveSync: () => set((state) => ({ liveSyncEnabled: !state.liveSyncEnabled })),

    fetchProductData: async (url) => {
        set({ isLoading: true, error: null });
        
        try {
            const sync = get().liveSyncEnabled;
            const response = await axios.post('https://customer-review-analysis-3.onrender.com/fetch-product-intelligence', {
                url: url,
                sync_live: sync
            });
            
            const data = response.data;
            const currentCatalog = get().catalog;
            
            // Persist historical items to filter the previous mock state correctly
            if (!currentCatalog.find(item => item.product_id === data.product_id)) {
                set({ 
                    catalog: [...currentCatalog, {
                        product_id: data.product_id,
                        url: data.url,
                        category: data.category,
                        name: data.product_meta.name,
                        image: data.product_meta.images[0]
                    }] 
                });
            }
            
            set({ 
                currentProductData: data,
                isLoading: false 
            });
            return true;
            
        } catch (err) {
            let errorMessage = "An unknown connection error occurred.";
            if (err.response && err.response.data && err.response.data.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.message) {
                errorMessage = err.message;
            }
            set({ 
                error: errorMessage,
                isLoading: false 
            });
            return false;
        }
    },
    
    loadFromCatalog: async (productId) => {
        const item = get().catalog.find(i => i.product_id === productId);
        if (item) {
            await get().fetchProductData(item.url, item.category);
        } else {
             set({ error: "Product Data Not Found", currentProductData: null });
        }
    },

    clearProduct: () => set({ currentProductData: null, error: null })
}));

export default useStore;
