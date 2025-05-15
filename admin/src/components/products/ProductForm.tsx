import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { productSchema, categorySchema } from "../../../../shared/schema";
import { X } from 'lucide-react';
type Product = z.infer<typeof productSchema>;
type Category = z.infer<typeof categorySchema>;
import { MongoProduct, MongoCategory } from "../../types/mongo";

type ProductFormValues = z.infer<typeof productSchema>;

export interface ProductFormProps {
  product?: MongoProduct;
  onSuccess?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(product?.images || []);

  // Get categories for the form
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/categories");
      return response.json();
    }
  });
  
  // Ensure categories is always an array
  const categories: MongoCategory[] = Array.isArray(categoriesData) ? categoriesData : [];
  
  // Initialize form with default values or product data if editing
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          sku: product.sku,
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription || "",
          price: product.price,
          discountedPrice: product.discountedPrice || null,
          stock: product.stock,
          categoryId: product.categoryId || "",
          slug: product.slug,
          featured: product.featured || false,
          bestseller: product.bestseller || false,
          isNew: product.isNew || false,
          videoUrl: product.videoUrl || "",
          imageUrl: product.imageUrl || "",
          images: product.images || [],
        }
      : {
          sku: "",
          name: "",
          description: "",
          shortDescription: "",
          price: 0,
          discountedPrice: null,
          stock: 0,
          categoryId: undefined,
          slug: "",
          featured: false,
          bestseller: false,
          isNew: true,
          videoUrl: "",
          imageUrl: "",
          images: [],
        },
  });

  // Handle form submit including images
  const handleSubmitWithImages = form.handleSubmit(
    async (data) => {
      console.log('🛎️ SUBMIT HANDLER FIRED', data); // debug
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        // Append all product fields, ensuring correct types
        formData.append('sku', data.sku);
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('shortDescription', data.shortDescription || '');
        formData.append('price', String(Number(data.price)));
        if (
          typeof data.discountedPrice === 'string' &&
          data.discountedPrice !== '' &&
          !isNaN(Number(data.discountedPrice))
        ) {
          formData.append('discountedPrice', String(Number(data.discountedPrice)));
        } else if (
          typeof data.discountedPrice === 'number' &&
          !isNaN(data.discountedPrice)
        ) {
          formData.append('discountedPrice', String(data.discountedPrice));
        }
        formData.append('stock', String(Number(data.stock)));
        formData.append('categoryId', data.categoryId);
        const slugToAppend = data.slug || data.name.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
        formData.append('slug', slugToAppend);
        formData.append('featured', data.featured ? 'true' : 'false');
        formData.append('bestseller', data.bestseller ? 'true' : 'false');
        formData.append('isNew', data.isNew ? 'true' : 'false');
        formData.append('videoUrl', data.videoUrl || '');

        // Append all selected image files
        imageFiles.forEach(file => formData.append('images', file));
        // For edit: also send existing image URLs to keep
        if (product && existingImages.length > 0) {
          existingImages.forEach(url => formData.append('existingImages', url));
        }
        // No longer append imageUrl manually (let backend set it from images array)

        // Send request (POST or PUT)
        const method = product ? 'PUT' : 'POST';
        const url = product ? `/api/products/${product._id}` : '/api/products';
        const response = await apiRequest(method, url, formData);
        if (!response.ok) throw new Error('Failed to save product');
        toast({ title: `Product ${product ? 'updated' : 'created'} successfully!` });
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        if (onSuccess) onSuccess();
      } catch (err) {
        toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save product', variant: 'destructive' });
      } finally {
        setIsSubmitting(false);
      }
    },
    (errors) => {
      console.log('FORM VALIDATION ERRORS', errors);
    }
  );

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  // Remove selected image before upload
  const handleRemoveSelectedImage = (idx: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles.splice(idx, 1);
    newPreviews.splice(idx, 1);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // Remove existing image (for edit)
  const handleRemoveExistingImage = (idx: number) => {
    const newExisting = [...existingImages];
    newExisting.splice(idx, 1);
    setExistingImages(newExisting);
  };

  // Generate slug from name
  const generateSlug = () => {
    const name = form.getValues("name");
    if (name) {
      const slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setValue("slug", slug);
    }
  };

  if (isCategoriesLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithImages} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SKU field */}
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Name field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name*</FormLabel>
                <FormControl>
                  <Input {...field} onBlur={() => {
                    if (!product && !form.getValues("slug")) {
                      generateSlug();
                    }
                  }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Slug field */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug*</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateSlug}
                    className="flex-shrink-0"
                  >
                    Generate
                  </Button>
                </div>
                <FormDescription>URL-friendly version of the name</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Price field */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price*</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value === undefined || field.value === null ? '' : field.value}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Discounted Price field */}
          <FormField
            control={form.control}
            name="discountedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discounted Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={field.value === null ? "" : field.value} 
                    onChange={e => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : parseFloat(value));
                    }} 
                  />
                </FormControl>
                <FormDescription>Leave empty for no discount</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Stock field */}
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock*</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value === undefined || field.value === null ? '' : field.value}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Category field */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                  disabled={categories.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <SelectItem value="none" disabled>No categories available</SelectItem>
                    ) : (
                      categories.map((category) => {
                        const categoryId = category.id || category._id;
                        return (
                          <SelectItem 
                            key={categoryId?.toString() || `cat-${category.name}`} 
                            value={categoryId?.toString() || `cat-${category.name}`}
                          >
                            {category.name}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Images input and preview */}
          <div className="col-span-full mb-4">
            <FormLabel>Product Images</FormLabel>
            <Input
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            {/* Preview existing images */}
            <div className="flex flex-wrap gap-2 mt-2">
              {existingImages.map((url, idx) => {
                // Always ensure the URL is /uploads/filename or /admin/uploads/filename
                let normalizedUrl = url;
                if (!url.startsWith('/uploads/')) {
                  normalizedUrl = `/uploads/${url.replace(/^\/+/, '')}`;
                }
                return (
                  <div key={`existing-${idx}`} className="relative">
                    <img
                      src={normalizedUrl}
                      alt={`existing-${idx}`}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }}
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Image';
                      }}
                    />
                    <button type="button" onClick={() => handleRemoveExistingImage(idx)} className="absolute -top-2 -right-2 bg-white rounded-full border shadow p-0.5">
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
              {/* Preview newly selected images */}
              {imagePreviews.map((url, idx) => (
                <div key={idx} className="relative">
                  <img src={url} alt={`preview-${idx}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '2px solid #aaa' }} />
                  <button type="button" onClick={() => handleRemoveSelectedImage(idx)} className="absolute -top-2 -right-2 bg-white rounded-full border shadow p-0.5">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <FormDescription>Upload up to 5 images. The first image will be used as the main image.</FormDescription>
          </div>
          
          {/* Video URL field */}
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Product Video URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://youtube.com/... or direct video link" {...field} />
                </FormControl>
                <FormDescription>Paste a YouTube link or direct video URL. If provided, a video icon will show on the product grid.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Short Description field */}
          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description for product listings" 
                    className="resize-none" 
                    rows={2}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Main Description field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Full Description*</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Detailed product description" 
                    className="resize-none" 
                    rows={5}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Featured checkbox */}
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured Product</FormLabel>
                  <FormDescription>
                    Featured products appear on the homepage.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {/* Bestseller checkbox */}
          <FormField
            control={form.control}
            name="bestseller"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Bestseller</FormLabel>
                  <FormDescription>
                    Mark as a bestselling product to highlight popularity.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {/* New Product checkbox */}
          <FormField
            control={form.control}
            name="isNew"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>New Product</FormLabel>
                  <FormDescription>
                    Highlight as a newly added product.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onSuccess) onSuccess();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                {product ? "Updating..." : "Creating..."}
              </>
            ) : (
              product ? "Update Product" : "Create Product"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
