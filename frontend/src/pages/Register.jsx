import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Camera, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const inputClass =
  'w-full rounded-2xl border border-outline/40 bg-surface-muted px-4 py-3 text-sm text-content placeholder:text-content-muted focus:border-brand focus:outline-none focus:ring-0 focus:shadow-focus transition';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({
        email: data.email,
        username: data.username,
        password: data.password,
      });
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
            <Sparkles className="h-7 w-7 text-brand-500" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-content">
            Crea tu cuenta
          </h1>
          <p className="mt-3 text-sm text-content-muted">
            Diseñado para compartir momentos con tu círculo más importante. Configura tu acceso en
            segundos.
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

              <Field label="Username">
                <input
                  {...register('username', {
                    required: 'El username es requerido',
                    minLength: {
                      value: 3,
                      message: 'Mínimo 3 caracteres',
                    },
                    maxLength: {
                      value: 30,
                      message: 'Máximo 30 caracteres',
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Solo letras, números y guiones bajos',
                    },
                  })}
                  type="text"
                  className={inputClass}
                  placeholder="eventscatcher"
                />
                {errors.username && <ErrorMessage>{errors.username.message}</ErrorMessage>}
              </Field>

              <Field label="Contraseña">
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 6,
                        message: 'Mínimo 6 caracteres',
                      },
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

              <Field label="Confirmar contraseña">
                <div className="relative">
                  <input
                    {...register('confirmPassword', {
                      required: 'Confirma tu contraseña',
                      validate: (value) => value === password || 'Las contraseñas no coinciden',
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`${inputClass} pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-content-muted"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>}
              </Field>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-[color:var(--color-on-accent)] shadow-soft transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <span className="spinner" /> : <Camera className="h-4 w-4" />}
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-content-muted">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Inicia sesión
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
    <div className="absolute left-1/3 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-brand/25 blur-3xl" />
    <div className="absolute bottom-20 right-16 h-52 w-52 rounded-full bg-brand/15 blur-3xl" />
    <div className="absolute left-12 bottom-32 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />
  </div>
);

export default Register;
