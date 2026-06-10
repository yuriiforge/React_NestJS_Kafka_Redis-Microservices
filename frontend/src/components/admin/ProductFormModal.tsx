import type { FormikProps } from 'formik';
import type { ProductPayload } from '@/api/products.api';
import type { Product } from '@/types';

const EMOJI_OPTIONS = [
  '📦','🎧','💻','📱','⌚','📷','🎮','🖥️','🖨️','🔌',
  '👟','👗','👔','🧢','👜','💍','🕶️','🧣','🧤','👒',
  '🏠','🛋️','🪴','🕯️','🪑','🛏️','🚿','🧹','🔧','🪟',
  '🎒','🧳','🎁','📚','🖊️','✂️','🔑','💡','🏋️','🎵',
];

interface Props {
  editing: Product | null;
  categories: string[];
  formik: FormikProps<ProductPayload>;
  onClose: () => void;
}

function FieldError({ formik, name }: { formik: FormikProps<ProductPayload>; name: keyof ProductPayload }) {
  return formik.touched[name] && formik.errors[name] ? (
    <p className="text-xs text-red-500 mt-0.5">{formik.errors[name] as string}</p>
  ) : null;
}

export function ProductFormModal({ editing, categories, formik, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">{editing ? 'Edit product' : 'New product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
        </div>

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Name</label>
            <input
              {...formik.getFieldProps('name')}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            <FieldError formik={formik} name="name" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Description</label>
            <textarea
              {...formik.getFieldProps('description')}
              rows={3}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black resize-none"
            />
            <FieldError formik={formik} name="description" />
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
              <FieldError formik={formik} name="price" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Stock</label>
              <input
                type="number"
                {...formik.getFieldProps('stock')}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              />
              <FieldError formik={formik} name="stock" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Category</label>
            <select
              {...formik.getFieldProps('category')}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              Emoji <span className="text-gray-400 font-normal">— selected: {formik.values.emoji}</span>
            </label>
            <div className="mt-1 flex flex-wrap gap-1.5 p-2 border rounded-lg max-h-28 overflow-y-auto">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => formik.setFieldValue('emoji', e)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-lg transition-colors ${
                    formik.values.emoji === e ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <FieldError formik={formik} name="emoji" />
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
              onClick={onClose}
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
  );
}
