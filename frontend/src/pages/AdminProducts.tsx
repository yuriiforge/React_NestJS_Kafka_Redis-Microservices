import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { productsApi, type ProductPayload } from '@/api/products.api';
import type { Product } from '@/types';

const CATEGORIES = ['Electronics', 'Sports', 'Home', 'Accessories'];

const schema = Yup.object({
  name:        Yup.string().min(2).required('Required'),
  description: Yup.string().min(10).required('Required'),
  price:       Yup.number().min(0).required('Required'),
  stock:       Yup.number().integer().min(0).required('Required'),
  category:    Yup.string().required('Required'),
  isActive:    Yup.boolean(),
});

const EMPTY: ProductPayload = { name: '', description: '', price: 0, stock: 0, category: 'Electronics', isActive: true };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function load() {
    setLoading(true);
    productsApi
      .list({ search: search || undefined, limit: 50 })
      .then((res) => { setProducts(res.data.items); setTotal(res.data.total); })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search]);

  const formik = useFormik<ProductPayload>({
    initialValues: editing
      ? { name: editing.name, description: editing.description, price: editing.price, stock: editing.stock, category: editing.category, isActive: editing.isActive }
      : EMPTY,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        if (editing) {
          const res = await productsApi.update(editing.id, values);
          setProducts((p) => p.map((x) => x.id === editing.id ? res.data : x));
          toast.success('Product updated');
        } else {
          const res = await productsApi.create(values);
          setProducts((p) => [res.data, ...p]);
          toast.success('Product created');
        }
        setFormOpen(false);
        setEditing(null);
        helpers.resetForm();
      } catch {
        toast.error('Failed to save product');
      }
    },
  });

  async function handleDelete(id: string) {
    try {
      await productsApi.remove(id);
      setProducts((p) => p.filter((x) => x.id !== id));
      setTotal((t) => t - 1);
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  }

  function openCreate() {
    setEditing(null);
    formik.resetForm({ values: EMPTY });
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setFormOpen(true);
  }

  const field = (name: keyof ProductPayload) =>
    formik.touched[name] && formik.errors[name] ? (
      <p className="text-xs text-red-500 mt-0.5">{formik.errors[name] as string}</p>
    ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your product catalogue</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          + Add product
        </button>
      </div>

      <div className="px-6 py-8 flex flex-col gap-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total',      value: total },
            { label: 'Active',     value: products.filter((p) => p.isActive).length },
            { label: 'Out of stock', value: products.filter((p) => p.stock === 0).length },
            { label: 'Low stock',  value: products.filter((p) => p.stock > 0 && p.stock < 10).length },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border px-4 py-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-semibold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-3">
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black w-64"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.category}</td>
                    <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock < 10 ? 'text-orange-500 font-medium' : ''}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:underline">
                          Edit
                        </button>
                        {deleting === p.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Sure?</span>
                            <button onClick={() => handleDelete(p.id)} className="text-xs text-red-600 font-medium">Yes</button>
                            <button onClick={() => setDeleting(null)} className="text-xs text-gray-400">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleting(p.id)} className="text-xs text-red-500 hover:underline">
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && products.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">No products found</div>
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFormOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editing ? 'Edit product' : 'New product'}</h2>
              <button onClick={() => setFormOpen(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Name</label>
                <input
                  {...formik.getFieldProps('name')}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                />
                {field('name')}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Description</label>
                <textarea
                  {...formik.getFieldProps('description')}
                  rows={3}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black resize-none"
                />
                {field('description')}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...formik.getFieldProps('price')}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                  {field('price')}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Stock</label>
                  <input
                    type="number"
                    {...formik.getFieldProps('stock')}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                  {field('stock')}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Category</label>
                <select
                  {...formik.getFieldProps('category')}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formik.values.isActive}
                  onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                  className="rounded"
                />
                Active
              </label>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="flex-1 bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
                >
                  {formik.isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
