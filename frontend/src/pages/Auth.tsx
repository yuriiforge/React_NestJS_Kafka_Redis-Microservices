import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import FormField from '@/components/FormField';
import { loginSchema, registerSchema } from '@/validation/auth.schemas';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { toastError } from '@/lib/errorHandler';

export default function AuthPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const loginForm = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        const { data } = await authApi.login(values);
        setTokens(data.accessToken, data.refreshToken);
        toast.success('You are logged in!');
        void navigate('/');
      } catch (err: unknown) {
        toastError(err);
      }
    },
  });

  const registerForm = useFormik({
    initialValues: {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      password: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        const { data } = await authApi.register(values);
        setTokens(data.accessToken, data.refreshToken);
        toast.success('You had successfully registered!');
        void navigate('/');
      } catch (err: unknown) {
        toastError(err);
      }
    },
  });

  const form = mode === 'login' ? loginForm : registerForm;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`pb-2 px-4 font-medium ${mode === 'login' ? 'border-b-2 border-black' : 'text-gray-400'}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`pb-2 px-4 font-medium ${mode === 'register' ? 'border-b-2 border-black' : 'text-gray-400'}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={form.handleSubmit} className="flex flex-col gap-4">
          {mode === 'login' ? (
            <>
              <FormField
                form={loginForm}
                name="email"
                label="Email"
                type="email"
              />
              <FormField
                form={loginForm}
                name="password"
                label="Password"
                type="password"
              />
            </>
          ) : (
            <>
              <FormField
                form={registerForm}
                name="email"
                label="Email"
                type="email"
              />
              <FormField form={registerForm} name="username" label="Username" />
              <FormField
                form={registerForm}
                name="firstName"
                label="First Name"
              />
              <FormField
                form={registerForm}
                name="lastName"
                label="Last Name"
              />
              <FormField
                form={registerForm}
                name="password"
                label="Password"
                type="password"
              />
            </>
          )}

          <button
            type="submit"
            disabled={form.isSubmitting}
            className="bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {form.isSubmitting
              ? 'Loading...'
              : mode === 'login'
                ? 'Login'
                : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
