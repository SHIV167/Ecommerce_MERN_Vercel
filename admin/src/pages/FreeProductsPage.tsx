import { useState, useEffect } from 'react';
// Using absolute import path instead of relative
import { useApiClient } from '@/hooks/useApiClient';
import { logApiResponse } from '@/utils/apiLogger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface FreeProduct {
  _id: string;
  productId: string;
  minOrderValue: number;
  createdAt: string;
  product?: {
    name: string;
    price: number;
    imageUrl?: string;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

export default function FreeProductsPage() {
  const { get, post, put, del } = useApiClient();
  const { toast } = useToast();
  const [freeProducts, setFreeProducts] = useState<FreeProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FreeProduct | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    minOrderValue: 0,
  });
  const [formErrors, setFormErrors] = useState({
    productId: '',
    minOrderValue: '',
  });

  // Load free products with product details
  const loadFreeProducts = async () => {
    setLoading(true);
    try {
      const response = await get('/api/admin/free-products');
      
      // Check if data is an array before proceeding
      if (!Array.isArray(response.data)) {
        console.error('Expected array response but got:', typeof response.data, response.data);
        toast({ 
          title: 'Invalid data format from server', 
          description: 'Please check your authentication status and try again.',
          variant: 'destructive' 
        });
        setFreeProducts([]);
        return;
      }
      
      // Fetch product details for each free product
      const freeProductsWithDetails = await Promise.all(
        response.data.map(async (freeProduct: FreeProduct) => {
          try {
            const productResponse = await get(`/api/products/${freeProduct.productId}`);
            return {
              ...freeProduct,
              product: productResponse.data
            };
          } catch (error) {
            console.warn(`Failed to fetch details for product ${freeProduct.productId}:`, error);
            return freeProduct;
          }
        })
      );
      
      setFreeProducts(freeProductsWithDetails);
    } catch (error: any) {
      console.error('Error loading free products:', error);
      toast({ 
        title: 'Failed to load free products', 
        description: error.message || 'Check authentication status',
        variant: 'destructive' 
      });
      setFreeProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load available products for dropdown
  const loadProducts = async () => {
    try {
      const response = await get('/api/products');
      
      // Log the response to understand its structure
      logApiResponse(response.data, { label: 'Products API Response', expandObjects: true });
      
      // Check response structure and extract products
      if (Array.isArray(response.data)) {
        // Direct array format - ensure products match expected type
        const validProducts = response.data.filter((item: unknown) => 
          item && typeof item === 'object' && '_id' in item && 'name' in item && 'price' in item
        ) as Product[];
        setProducts(validProducts);
      } else if (response.data && typeof response.data === 'object') {
        // Check if response has a products property that's an array
        if (Array.isArray(response.data.products)) {
          const validProducts = response.data.products.filter((item: unknown) => 
            item && typeof item === 'object' && '_id' in item && 'name' in item && 'price' in item
          ) as Product[];
          setProducts(validProducts);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Some APIs return data in a nested 'data' property
          const validProducts = response.data.data.filter((item: unknown) => 
            item && typeof item === 'object' && '_id' in item && 'name' in item && 'price' in item
          ) as Product[];
          setProducts(validProducts);
        } else {
          // Try to extract values if it's an object of products
          const extractedProducts = Object.values(response.data);
          if (Array.isArray(extractedProducts) && extractedProducts.length > 0 && 
              extractedProducts[0] && typeof extractedProducts[0] === 'object') {
            // Validate and cast the extracted products to ensure they match the Product type
            const validProducts = extractedProducts.filter((item: unknown) => 
              item && typeof item === 'object' && '_id' in item && 'name' in item && 'price' in item
            ) as Product[];
            
            setProducts(validProducts);
          } else {
            console.error('Could not extract products array from:', response.data);
            toast({ 
              title: 'Invalid product data format', 
              description: 'Please check the API response structure',
              variant: 'destructive' 
            });
            setProducts([]);
          }
        }
      } else {
        console.error('Expected array or object for products but got:', typeof response.data, response.data);
        toast({ 
          title: 'Invalid product data format', 
          description: 'Please check the API response',
          variant: 'destructive' 
        });
        // Initialize with empty array to prevent map errors
        setProducts([]);
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast({ 
        title: 'Failed to load product list', 
        description: error.message || 'API request failed',
        variant: 'destructive' 
      });
      // Initialize with empty array to prevent map errors
      setProducts([]);
    }
  };

  useEffect(() => {
    loadFreeProducts();
    loadProducts();
  }, []);

  const validateForm = () => {
    const errors = {
      productId: '',
      minOrderValue: '',
    };
    
    if (!formData.productId) {
      errors.productId = 'Please select a product';
    }
    
    if (formData.minOrderValue <= 0) {
      errors.minOrderValue = 'Minimum order value must be greater than zero';
    }
    
    setFormErrors(errors);
    return !errors.productId && !errors.minOrderValue;
  };

  const handleOpenModal = (freeProduct: FreeProduct | null = null) => {
    if (freeProduct) {
      setEditingProduct(freeProduct);
      setFormData({
        productId: freeProduct.productId,
        minOrderValue: freeProduct.minOrderValue,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        productId: '',
        minOrderValue: 0,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormErrors({
      productId: '',
      minOrderValue: '',
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (editingProduct) {
        // Update existing free product
        await put(`/api/admin/free-products/${editingProduct._id}`, formData);
        toast({ title: 'Free product updated successfully' });
      } else {
        // Create new free product
        await post('/api/admin/free-products', formData);
        toast({ title: 'Free product created successfully' });
      }
      handleCloseModal();
      loadFreeProducts();
    } catch (error) {
      console.error('Error saving free product:', error);
      toast({ title: 'Failed to save free product', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this free product?')) return;
    
    setLoading(true);
    try {
      await del(`/api/admin/free-products/${id}`);
      toast({ title: 'Free product deleted successfully' });
      loadFreeProducts();
    } catch (error) {
      console.error('Error deleting free product:', error);
      toast({ title: 'Failed to delete free product', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Free Products Management</h1>
        <Button onClick={() => handleOpenModal()}>Add New Free Product</Button>
      </div>

      {loading && freeProducts.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="mr-2 h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Minimum Order Value</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {freeProducts.length > 0 ? (
                freeProducts.map((freeProduct) => (
                  <TableRow key={freeProduct._id}>
                    <TableCell>
                      <div className="flex items-center">
                        {freeProduct.product?.imageUrl && (
                          <img 
                            src={freeProduct.product.imageUrl} 
                            alt={freeProduct.product.name} 
                            className="w-10 h-10 object-cover rounded mr-2"
                          />
                        )}
                        <div>
                          <div>{freeProduct.product?.name || 'Unknown Product'}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {freeProduct.productId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>₹{freeProduct.minOrderValue.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(freeProduct.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenModal(freeProduct)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(freeProduct._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No free products found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Free Product' : 'Add New Free Product'}
            </DialogTitle>
            <DialogDescription>
              Set a product that will be offered for free when a customer's order reaches the minimum order value.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <select
                id="product"
                className="w-full px-3 py-2 border border-input rounded-md"
                value={formData.productId}
                onChange={(e) => setFormData({...formData, productId: e.target.value})}
                disabled={editingProduct !== null}
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - ₹{product.price.toFixed(2)}
                  </option>
                ))}
              </select>
              {formErrors.productId && (
                <p className="text-destructive text-sm">{formErrors.productId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderValue">Minimum Order Value (₹)</Label>
              <Input
                id="minOrderValue"
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({...formData, minOrderValue: parseFloat(e.target.value)})}
              />
              {formErrors.minOrderValue && (
                <p className="text-destructive text-sm">{formErrors.minOrderValue}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
