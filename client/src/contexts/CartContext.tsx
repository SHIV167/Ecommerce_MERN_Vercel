import { createContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  totalItems: number;
  isEmpty: boolean;
  freeProducts: Product[];
  eligibleFreeProducts: Product[];
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addItem: async () => {},
  removeItem: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  subtotal: 0,
  totalItems: 0,
  isEmpty: true,
  freeProducts: [],
  eligibleFreeProducts: [],
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [freeProducts, setFreeProducts] = useState<Product[]>([]);
  const [eligibleFreeProducts, setEligibleFreeProducts] = useState<Product[]>([]);

  // Calculate derived values
  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      (item.product && typeof item.product.price === 'number'
        ? item.product.price * item.quantity
        : 0),
    0
  );
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isEmpty = cartItems.length === 0;

  // Load free products
  useEffect(() => {
    const loadFreeProducts = async () => {
      try {
        const response = await apiRequest('GET', '/api/free-products');
        if (response.ok) {
          const data = await response.json();
          // Get product details for each free product
          const productsWithDetails = await Promise.all(
            data.map(async (freeProduct: any) => {
              try {
                const productResponse = await apiRequest('GET', `/api/products/${freeProduct.productId}`);
                if (productResponse.ok) {
                  const productData = await productResponse.json();
                  return {
                    ...productData,
                    minOrderValue: freeProduct.minOrderValue,
                    isFreeProduct: true
                  };
                }
              } catch (error) {
                console.error('Failed to fetch product details:', error);
              }
              return null;
            })
          );
          setFreeProducts(productsWithDetails.filter(Boolean));
        }
      } catch (error) {
        console.error('Failed to load free products:', error);
      }
    };
    loadFreeProducts();
  }, []);

  // Check for eligible free products when subtotal changes and manage free products
  useEffect(() => {
    const eligible = freeProducts.filter(
      (product) => product && typeof product.minOrderValue === 'number' && product.minOrderValue <= subtotal
    );
    setEligibleFreeProducts(eligible);

    // Get non-free items in cart
    const nonFreeItems = cartItems.filter(item => !item.product?.isFreeProduct);

    // If cart is empty (no non-free items), remove all free products
    if (nonFreeItems.length === 0) {
      cartItems.forEach(item => {
        if (item.product?.isFreeProduct) {
          removeItem(item.id);
        }
      });
      return;
    }

    // Automatically add eligible free products to cart
    eligible.forEach(async (product) => {
      if (!product?._id) return;
      
      const isInCart = cartItems.some(
        item => item.product?._id === product._id
      );

      if (!isInCart) {
        try {
          // Add the free product flag
          const freeProduct = {
            ...product,
            isFreeProduct: true
          };
          await addItem(freeProduct);
        } catch (error) {
          console.error('Failed to add free product:', error);
        }
      }
    });

    // Remove non-eligible free products
    cartItems.forEach(item => {
      if (item.product?.isFreeProduct && !eligible.some(p => p._id === item.product._id)) {
        removeItem(item.id);
      }
    });
  }, [subtotal, freeProducts, cartItems]);

  // Initialize cart on component mount
  useEffect(() => {
    const initializeCart = async () => {
      try {
        // Generate a unique session ID if we don't have one
        let sessionId = localStorage.getItem("cartSessionId");
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          localStorage.setItem("cartSessionId", sessionId);
        }

        // Fetch cart from API
        const response = await fetch(`/api/cart?sessionId=${sessionId}`, {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setCartId(data.id);
          
          if (data.items && Array.isArray(data.items)) {
            setCartItems(data.items);
          }
        }
      } catch (error) {
        console.error("Failed to initialize cart:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, []);

  // Add item to cart with optimistic updates
  const addItem = async (product: Product) => {
    const previousItems = [...cartItems];
    try {
      // Ensure cartId is available before proceeding
      let currentCartId = cartId;
      if (!currentCartId) {
        const sessionId = localStorage.getItem("cartSessionId");
        const cartResponse = await apiRequest("GET", `/api/cart?sessionId=${sessionId}`);
        const cartData = await cartResponse.json();
        setCartId(cartData.id);
        currentCartId = cartData.id;
      }
      if (!currentCartId) throw new Error("Cart ID not initialized");

      // Find if the item already exists
      const existingItemIndex = cartItems.findIndex(
        (item) => {
          const itemId = (item.product as any).id ?? (item.product as any)._id;
          const prodId = (product as any).id ?? (product as any)._id;
          return itemId === prodId;
        }
      );

      if (existingItemIndex !== -1) {
        // Optimistically update existing item
        const updatedItems = [...cartItems];
        updatedItems[existingItemIndex].quantity += 1;
        setCartItems(updatedItems);

        // Update in API
        await apiRequest("PUT", `/api/cart/items/${cartItems[existingItemIndex].id}`, {
          quantity: updatedItems[existingItemIndex].quantity,
        });
      } else {
        // Create a temporary item for new addition
        const tempItem: CartItem = {
          id: Date.now(),
          product,
          quantity: 1,
        };
        setCartItems([...cartItems, tempItem]);

        // Add to API
        const prodId = (product as any).id ?? (product as any)._id;
        const response = await apiRequest("POST", "/api/cart/items", {
          cartId: currentCartId,
          productId: prodId,
          quantity: 1,
        });
        // Defensive: handle empty or invalid JSON
        let data: any = {};
        try {
          const text = await response.text();
          data = text ? JSON.parse(text) : {};
        } catch (err) {
          data = {};
        }
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === tempItem.id ? { ...item, id: (data as any)?.id ?? item.id } : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      setCartItems(previousItems);
      throw error;
    }
  };

  // Remove item from cart with optimistic updates
  const removeItem = async (itemId: number) => {
    // Store previous state for rollback
    const previousItems = [...cartItems];
    
    try {
      // Optimistically remove item
      setCartItems(cartItems.filter((item) => item.id !== itemId));

      // Remove from API
      if (cartId) {
        await apiRequest("DELETE", `/api/cart/items/${itemId}`, null);
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      // Rollback on error
      setCartItems(previousItems);
    }
  };

  // Update item quantity with optimistic updates
  const updateQuantity = async (itemId: number, quantity: number) => {
    // Store previous state for rollback
    const previousItems = [...cartItems];

    try {
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }

      // Optimistically update quantity
      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );

      // Update in API
      if (cartId) {
        await apiRequest("PUT", `/api/cart/items/${itemId}`, { quantity });
      }
    } catch (error) {
      console.error("Failed to update cart item quantity:", error);
      // Rollback on error
      setCartItems(previousItems);
    }
  };

  // Clear cart with optimistic updates
  const clearCart = async () => {
    // Store previous state for rollback
    const previousItems = [...cartItems];

    try {
      // First remove all free products
      const freeItemIds = cartItems
        .filter(item => item.product?.isFreeProduct)
        .map(item => item.id);
      
      for (const id of freeItemIds) {
        await removeItem(id);
      }

      // Then clear remaining items
      setCartItems([]);

      // Clear in API
      if (cartId) {
        await apiRequest("DELETE", `/api/cart/${cartId}`, null);
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
      // Rollback on error
      setCartItems(previousItems);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        isEmpty,
        freeProducts,
        eligibleFreeProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
