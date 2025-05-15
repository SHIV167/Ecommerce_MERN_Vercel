import React from "react";
import { Product } from "@shared/schema";
import { MongoProduct, MongoCategory } from "@/types/mongo";
import type { ProductCollection } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProductTableProps {
  products: MongoProduct[];
  isLoading: boolean;
  onDelete: (product: MongoProduct) => void;
  onEdit: (product: MongoProduct) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, isLoading, onDelete, onEdit }) => {
  // Load categories for display
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/categories");
      return response.json();
    }
  });
  const categories = Array.isArray(categoriesData) ? categoriesData as MongoCategory[] : [];

  // Fetch all collections
  const { data: collectionsData } = useQuery({
    queryKey: ['/api/collections'],
    queryFn: async () => (await apiRequest('GET', '/api/collections')).json()
  });
  const collections = Array.isArray(collectionsData) ? collectionsData as MongoCategory[] : [];

  // Helper: map product to its categories
  const getCategoryName = (categoryId: string | number) => {
    const idStr = categoryId.toString();
    const category = categories.find(c =>
      c._id?.toString() === idStr || c.id?.toString() === idStr
    );
    return category ? category.name : `Category ${idStr}`;
  };

  // Helper: map product to its collections via ProductCollection join
  const { data: pcData } = useQuery({
    queryKey: ['/api/product-collections'],
    queryFn: async () => (await apiRequest('GET', '/api/product-collections')).json()
  });
  const pcs = Array.isArray(pcData) ? pcData as ProductCollection[] : [];
  const getCollectionsForProduct = (prod: MongoProduct) => {
    const pid = prod._id?.toString() || prod.id?.toString();
    return pcs
      .filter(pc => pc.productId === pid)
      .map(pc => {
        const idStr = pc.collectionId;
        const col = collections.find(c =>
          c._id?.toString() === idStr || c.id?.toString() === idStr
        );
        return col ? col.name : `Collection ${idStr}`;
      });
  };

  // Helper function to get the product image URL
  const getProductImageUrl = (product: MongoProduct) => {
    // First check if the product has an images array with at least one item
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage && typeof firstImage === 'string' && firstImage.trim() !== '') {
        return firstImage;
      }
    }
    
    // Then check for main imageUrl
    if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim() !== '') {
      return product.imageUrl;
    }
    
    // Fallback to a reliable placeholder
    return 'https://placehold.co/100x100?text=No+Image';
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-background/50 p-8 text-center rounded-lg border border-dashed">
        <h3 className="text-lg font-medium">No products found</h3>
        <p className="text-muted-foreground mt-1">
          Get started by creating a new product.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-4 py-3.5 text-left text-sm font-medium text-muted-foreground">
                <span className="sr-only">Select</span>
              </th>
              <th scope="col" className="px-4 py-3.5 text-left text-sm font-medium text-muted-foreground">SKU</th>
              <th scope="col" className="px-4 py-3.5 text-left text-sm font-medium text-muted-foreground">
                Product
              </th>
              <th scope="col" className="px-4 py-3.5 text-left text-sm font-medium text-muted-foreground">
                Category
              </th>
              <th scope="col" className="px-4 py-3.5 text-left text-sm font-medium text-muted-foreground">
                Collections
              </th>
              <th scope="col" className="px-4 py-3.5 text-right text-sm font-medium text-muted-foreground">
                Stock
              </th>
              <th scope="col" className="px-4 py-3.5 text-right text-sm font-medium text-muted-foreground">
                Price
              </th>
              <th scope="col" className="px-4 py-3.5 text-right text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5 text-right text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {products.map((product) => (
              <tr key={product._id?.toString() || product.id?.toString()} className="hover:bg-muted/50">
                <td className="whitespace-nowrap px-4 py-4">
                  <Checkbox />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm">{product.sku}</td>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.name}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite fallback loop
                          target.src = 'https://placehold.co/100x100?text=No+Image';
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {getCategoryName(product.categoryId)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm">
                  {getCollectionsForProduct(product).map(name => (
                    <span key={name} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                      {name}
                    </span>
                  ))}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-right">
                  {product.stock > 0 ? (
                    <span className="text-green-600">{product.stock}</span>
                  ) : (
                    <span className="text-red-600">Out of stock</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-right">
                  <div className="font-medium">${product.price.toFixed(2)}</div>
                  {product.discountedPrice && (
                    <div className="text-xs text-green-600">
                      ${product.discountedPrice.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-right">
                  <div className="flex justify-end gap-1 flex-wrap">
                    {product.featured && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Featured
                      </Badge>
                    )}
                    {product.bestseller && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        Bestseller
                      </Badge>
                    )}
                    {product.isNew && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        New
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-destructive/90 bg-destructive text-destructive-foreground hover:text-destructive-foreground h-9 px-3"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
