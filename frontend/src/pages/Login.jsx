import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Camera, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const inputClass =
  'w-full rounded-2xl border border-outline/40 bg-surface-muted px-4 py-3 text-sm text-content placeholder:text-content-muted focus:border-brand focus:outline-none focus:ring-0 focus:shadow-focus transition';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (error) {
      // handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <BackgroundAccent />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-8">
        <header className="ui-card border border-outline/30 px-8 py-10 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-outline/40 bg-surface-muted shadow-soft">
            <Camera className="h-7 w-7 text-brand-500" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-content">Bienvenido</h1>
          <p className="mt-3 text-sm text-content-muted">
            Accede a tus álbumes inteligentes y revive cada momento compartido.
          </p>
        </header>

        <section className="ui-card border border-outline/30 px-8 py-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Field label="Email">
                <input
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  })}
                  type="email"
                  className={inputClass}
                  placeholder="hola@eventscatch.io"
                />
                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
              </Field>

              <Field label="Contraseña">
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'La contraseña es requerida',
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className={`${inputClass} pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-content-muted"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
              </Field>
            </div>

            <div className="flex items-center justify-between text-xs text-content-muted">
              <div className="inline-flex items-center gap-2 rounded-full border border-outline/40 bg-surface-muted px-3 py-1.5">
                <Lock className="h-3.5 w-3.5 text-brand-500" />
                Sesión segura
              </div>
              <span className="text-content-secondary">
                ¿Olvidaste tu contraseña? Contacta con soporte.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-[color:var(--color-on-accent)] shadow-soft transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Iniciando sesión...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-content-muted">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold text-brand hover:underline">
              Crear una nueva
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-content-muted">
    {label}
    {children}
  </label>
);

const ErrorMessage = ({ children }) => (
  <p className="text-xs font-medium text-danger">{children}</p>
);

const BackgroundAccent = () => (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-brand/30 blur-3xl" />
    <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-brand/20 blur-3xl" />
    <div className="absolute left-10 bottom-32 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />
  </div>
);

export default Login;
