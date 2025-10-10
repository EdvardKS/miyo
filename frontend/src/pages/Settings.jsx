import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import {
  User,
  Globe,
  Lock,
  Upload,
  Sparkles,
  LogOut,
  Trash2,
} from 'lucide-react';

const themeOptions = [
  { value: 'system', title: 'Auto', description: 'Sincroniza con el modo del sistema' },
  { value: 'light', title: 'Claro', description: 'Fondos luminosos y texto oscuro' },
  { value: 'dark', title: 'Oscuro', description: 'Tonos cálidos para entornos oscuros' },
];

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout, deleteAccount, changePassword } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [infoForm, setInfoForm] = useState({
    username: user?.username ?? '',
    bio: user?.bio ?? '',
    isPublicProfile: !!user?.isPublicProfile,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleInfoChange = (field) => (event) => {
    const value = field === 'isPublicProfile' ? event.target.checked : event.target.value;
    setInfoForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleInfoSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile(infoForm);
      toast.success('Perfil actualizado');
    } catch (error) {
      // errores ya notificados desde el contexto
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    event.preventDefault();
    const fileInput = event.currentTarget.querySelector('input[type=file]');
    if (!fileInput.files?.[0]) {
      toast.error('Selecciona una imagen');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', fileInput.files[0]);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/users/me/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      toast.success('Avatar actualizado');
      window.location.reload();
    } catch (error) {
      toast.error('No se pudo actualizar el avatar');
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Completa los dos campos');
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Contraseña actualizada');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      // mensaje ya mostrado desde el contexto
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Esta acción eliminará tu cuenta y todos tus álbumes. ¿Quieres continuar?',
    );
    if (!confirmed) return;

    try {
      await deleteAccount();
      toast.success('Tu cuenta ha sido eliminada');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'No se pudo eliminar la cuenta';
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="ui-card border border-outline/30 px-8 py-10 shadow-soft">
        <div className="inline-flex items-center gap-3 rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-brand">
          <Sparkles className="h-5 w-5" />
          Configuración de la cuenta
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-content">
          Controla tu experiencia en EventsCatch
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-content-muted">
          Edita tu perfil, selecciona el modo de color y gestiona la seguridad de tu cuenta desde
          esta vista centralizada.
        </p>
      </header>

      <section className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
        <h2 className="text-lg font-semibold text-content">Información de perfil</h2>
        <p className="mt-1 text-sm text-content-muted">
          Actualiza los datos visibles en tu perfil público.
        </p>
        <form onSubmit={handleInfoSubmit} className="mt-6 space-y-6">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-content-muted">
              Username
            </label>
            <input
              type="text"
              value={infoForm.username}
              onChange={handleInfoChange('username')}
              className="mt-2 w-full rounded-xl border border-outline/40 bg-surface-muted px-4 py-3 text-sm text-content placeholder:text-content-muted focus:border-brand focus:outline-none focus:ring-0"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-content-muted">
              Biografía
            </label>
            <textarea
              value={infoForm.bio}
              onChange={handleInfoChange('bio')}
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-outline/40 bg-surface-muted px-4 py-3 text-sm text-content placeholder:text-content-muted focus:border-brand focus:outline-none focus:ring-0"
            />
            <p className="mt-1 text-xs text-content-muted">
              Aparece debajo de tu nombre en el perfil.
            </p>
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-outline/40 bg-surface-muted px-4 py-3 text-sm text-content transition hover:border-brand">
            <input
              type="checkbox"
              checked={infoForm.isPublicProfile}
              onChange={handleInfoChange('isPublicProfile')}
              className="size-4 accent-brand"
            />
            {infoForm.isPublicProfile ? (
              <>
                <Globe className="h-4 w-4 text-brand-500" />
                Perfil público
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 text-brand-500" />
                Perfil privado
              </>
            )}
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-[color:var(--color-on-accent)] shadow-soft transition hover:shadow-lg disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <form onSubmit={handleAvatarUpload} className="flex items-center gap-3">
              <label className="rounded-full border border-outline/40 px-4 py-2 text-sm font-semibold text-content transition hover:border-brand hover:text-brand">
                <span className="inline-flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Actualizar avatar
                </span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
              <button
                type="submit"
                className="rounded-full border border-outline/40 px-4 py-2 text-sm font-semibold text-content transition hover:border-brand hover:text-brand"
              >
                Subir
              </button>
            </form>
          </div>
        </form>
      </section>

      <section className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
        <h2 className="text-lg font-semibold text-content">Preferencias de tema</h2>
        <p className="mt-1 text-sm text-content-muted">
          Resultado actual: <strong>{resolvedTheme}</strong>
        </p>
        <div className="mt-6 space-y-3">
          {themeOptions.map(({ value, title, description }) => {
            const active = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  active
                    ? 'border-brand bg-accent/10 text-content shadow-soft'
                    : 'border-outline/40 bg-surface-muted text-content hover:border-brand/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{title}</span>
                  {active ? (
                    <span className="rounded-full bg-brand px-2 py-1 text-xs font-semibold text-[color:var(--color-on-accent)]">
                      Activo
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-content-muted">{description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
        <h2 className="text-lg font-semibold text-content">Seguridad</h2>
        <form onSubmit={handlePasswordSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-content-muted">
              Contraseña actual
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-outline/40 bg-surface-muted px-4 py-3 text-sm text-content placeholder:text-content-muted focus:border-brand focus:outline-none focus:ring-0"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-content-muted">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-outline/40 bg-surface-muted px-4 py-3 text-sm text-content placeholder:text-content-muted focus:border-brand focus:outline-none focus:ring-0"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-outline/40 px-4 py-2 text-sm font-semibold text-content transition hover:border-brand hover:text-brand"
              disabled={changingPassword}
            >
              {changingPassword ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </section>

      <section className="ui-card border border-outline/30 px-6 py-8 sm:px-10">
        <h2 className="text-lg font-semibold text-content">Zona peligrosa</h2>
        <p className="mt-1 text-sm text-content-muted">
          Gestiona el acceso a tu cuenta. Estas acciones no pueden deshacerse.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-outline/40 px-4 py-2 text-sm font-semibold text-content transition hover:border-brand hover:text-brand"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-danger/30 px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar cuenta
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
