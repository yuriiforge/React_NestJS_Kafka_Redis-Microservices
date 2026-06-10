import { useAdminProducts } from '@/hooks/useAdminProducts';
import { ProductStatsCards } from '@/components/admin/ProductStatsCards';
import { ProductTable } from '@/components/admin/ProductTable';
import { ProductFormModal } from '@/components/admin/ProductFormModal';

export default function AdminProductsPage() {
  const {
    list, categories, search, setSearch,
    form, setForm, deleting, setDeleting,
    editing, openCreate, deleteProduct, formik,
  } = useAdminProducts();

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
        <ProductStatsCards total={list.total} items={list.items} />

        <ProductTable
          items={list.items}
          loading={list.loading}
          search={search}
          deleting={deleting}
          onSearchChange={setSearch}
          onEdit={setForm}
          onDeleteRequest={setDeleting}
          onDeleteConfirm={deleteProduct}
          onDeleteCancel={() => setDeleting(null)}
        />
      </div>

      {form !== null && (
        <ProductFormModal
          editing={editing}
          categories={categories}
          formik={formik}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
}
