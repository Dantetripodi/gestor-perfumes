import { useState } from 'react';
import { Product } from '../types';
import { DEFAULT_PRODUCT } from '../constants/productDefaults';

export const useProductForm = (initialProduct?: Partial<Product>) => {
  const [product, setProduct] = useState<Partial<Product>>(
    initialProduct || DEFAULT_PRODUCT
  );

  const resetForm = () => setProduct(DEFAULT_PRODUCT);

  const updateField = <K extends keyof Product>(field: K, value: Product[K]) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const updateMultipleFields = (fields: Partial<Product>) => {
    setProduct((prev) => ({ ...prev, ...fields }));
  };

  const loadProduct = (productData: Partial<Product>) => {
    setProduct(productData);
  };

  return {
    product,
    setProduct,
    resetForm,
    updateField,
    updateMultipleFields,
    loadProduct,
  };
};