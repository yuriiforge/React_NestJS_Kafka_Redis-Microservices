import { useFormik } from 'formik';

interface FormFieldProps {
  form: {
    values: Record<string, string>;
    handleChange: ReturnType<typeof useFormik>['handleChange'];
    handleBlur: ReturnType<typeof useFormik>['handleBlur'];
    touched: Record<string, boolean | undefined>;
    errors: Record<string, string | undefined>;
  };
  name: string;
  label: string;
  type?: string;
}

export default function FormField({ form, name, label, type = 'text' }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        value={form.values[name]}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
      />
      {form.touched[name] && form.errors[name] && (
        <p className="text-red-500 text-xs">{form.errors[name]}</p>
      )}
    </div>
  );
}
