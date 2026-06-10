import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { productsApi, type ProductPayload } from '@/api/products.api';
import type { Product } from '@/types';

export type FormState = null | 'create' | Product;

const schema = Yup.object({
  name:        Yup.string().min(2).required('Required'),
  description: Yup.string().min(10).required('Required'),
  price:       Yup.number().min(0).required('Required'),
  stock:       Yup.number().integer().min(0).required('Required'),
  category:    Yup.string().required('Required'),
  emoji:       Yup.string().required('Required'),
  isActive:    Yup.boolean(),
});

const EMPTY: ProductPayload = { name: '', description: '', price: 0, stock: 0, category: '', emoji: '📦', isActive: true };

export function useAdminProducts() {
  const [list, setList] = useState<{ items: Product[]; total: number; loading: boolean }>(
    { items: [], total: 0, loading: true },
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FormState>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const editing = form !== null && form !== 'create' ? form : null;

  useEffect(() => {
    productsApi.categories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setList((s) => ({ ...s, loading: true }));
    productsApi
      .list({ search: search || undefined, limit: 50 })
      .then((res) => setList({ items: res.data.items, total: res.data.total, loading: false }))
      .catch(() => { toast.error('Failed to load products'); setList((s) => ({ ...s, loading: false })); });
  }, [search]);

  const formik = useFormik<ProductPayload>({
    initialValues: editing
      ? { name: editing.name, description: editing.description, price: editing.price, stock: editing.stock, category: editing.category, emoji: editing.emoji, isActive: editing.isActive }
      : EMPTY,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        if (editing) {
          const res = await productsApi.update(editing.id, values);
          setList((s) => ({ ...s, items: s.items.map((x) => x.id === editing.id ? res.data : x) }));
          toast.success('Product updated');
        } else {
          const res = await productsApi.create(values);
          setList((s) => ({ ...s, items: [res.data, ...s.items], total: s.total + 1 }));
          toast.success('Product created');
        }
        setForm(null);
        helpers.resetForm();
      } catch {
        toast.error('Failed to save product');
      }
    },
  });

  async function deleteProduct(id: string) {
    try {
      await productsApi.remove(id);
      setList((s) => ({ ...s, items: s.items.filter((x) => x.id !== id), total: s.total - 1 }));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  }

  function openCreate() {
    formik.resetForm({ values: { ...EMPTY, category: categories[0] ?? '' } });
    setForm('create');
  }

  return {
    list,
    categories,
    search, setSearch,
    form, setForm,
    deleting, setDeleting,
    editing,
    openCreate,
    deleteProduct,
    formik,
  };
}
