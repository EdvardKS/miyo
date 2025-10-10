import React from 'react';
import { Shield, Lock, Eye, User, Mail } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <section className="space-y-3 rounded-2xl border border-outline/30 bg-surface px-6 py-5">
    <header className="flex items-center gap-3">
      {Icon ? <Icon className="h-5 w-5 text-brand" /> : null}
      <h2 className="text-lg font-semibold text-content">{title}</h2>
    </header>
    <div className="text-sm leading-relaxed text-content-muted">{children}</div>
  </section>
);

const Privacy = () => (
  <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
    <header className="space-y-3 rounded-3xl border border-outline/30 bg-surface px-8 py-10 shadow-soft">
      <div className="inline-flex items-center gap-3 rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-brand">
        <Shield className="h-5 w-5" />
        Políticas transparentes
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-content">Política de privacidad</h1>
      <p className="max-w-2xl text-sm text-content-muted">
        Nos comprometemos a proteger tus datos y a ofrecerte control total sobre tu información. A continuación
        te explicamos qué recopilamos, cómo lo usamos y qué opciones tienes.
      </p>
    </header>

    <div className="flex flex-col gap-6">
      <Section icon={Eye} title="Información que recopilamos">
        <InfoList
          groups={[
            {
              heading: 'Información de cuenta',
              bullets: [
                'Email y nombre de usuario',
                'Contraseña cifrada (bcrypt)',
                'Avatar y biografía opcionales',
                'Preferencias de privacidad',
              ],
            },
            {
              heading: 'Datos de eventos',
              bullets: [
                'Álbumes que creas o unes',
                'Fotos y vídeos compartidos',
                'Ubicaciones de eventos',
                'Comentarios e interacciones',
              ],
            },
            {
              heading: 'Datos técnicos',
              bullets: [
                'Dirección IP y dispositivo',
                'Información de navegador',
                'Patrones de uso de la app',
                'Ubicación aproximada',
              ],
            },
          ]}
        />
      </Section>

      <Section icon={Lock} title="Cómo usamos tu información">
        <BulletedList
          intro="Procesamos tus datos únicamente para:"
          items={[
            ['Proporcionar el servicio', 'Gestionar tu cuenta, álbumes y fotos.'],
            ['Mejorar la experiencia', 'Personalizar recomendaciones y contenido.'],
            ['Comunicaciones esenciales', 'Notificaciones relevantes sobre tu actividad.'],
            ['Seguridad', 'Prevenir fraude, abuso y accesos no autorizados.'],
            ['Análisis', 'Entender el uso de la plataforma y optimizarla.'],
          ]}
        />
      </Section>

      <Section icon={User} title="Control sobre tus datos">
        <BulletedList
          intro="Tienes el control total para:"
          items={[
            ['Definir visibilidad', 'Alternar entre perfil público o privado, y decidir quién participa.'],
            ['Gestionar álbumes', 'Crear eventos privados, revocar accesos o eliminar contenidos.'],
            ['Moderación personal', 'Aceptar seguidores, bloquear usuarios y moderar comentarios.'],
            ['Derecho al olvido', 'Solicitar la eliminación completa de tus datos.'],
          ]}
        />
      </Section>

      <Section title="Seguridad y retención de datos">
        <BulletedList
          intro="Medidas implementadas:"
          items={[
            ['Cifrado y transporte seguro', 'Contraseñas encriptadas y conexiones HTTPS.'],
            ['Autenticación robusta', 'Tokens JWT con expiración y rotación.'],
            ['Protección activa', 'Limitación de peticiones y validaciones estrictas.'],
            ['Retención controlada', 'Datos activos mientras uses el servicio; registros técnicos hasta 6 meses.'],
          ]}
        />
      </Section>

      <Section title="Compartición responsable">
        <BulletedList
          intro="Solo compartimos tus datos cuando:"
          items={[
            ['Das tu consentimiento', 'Expresamente, para funcionalidades específicas.'],
            ['Lo exige la ley', 'Cumplimiento de obligaciones legales o judiciales.'],
            ['Proveedores confiables', 'Servicios necesarios (hosting, analítica) bajo acuerdos de tratamiento.'],
            ['Cambio societario', 'En adquisiciones o fusiones, garantizando protección equivalente.'],
          ]}
        />
      </Section>

      <Section title="Tus derechos">
        <BulletedList
          intro="Puedes ejercer en cualquier momento tus derechos de:"
          items={[
            ['Acceso y rectificación', 'Revisar y corregir tu información personal.'],
            ['Portabilidad', 'Recibir tus datos en un formato estructurado.'],
            ['Oposición o restricción', 'Limitar determinados tratamientos.'],
            ['Eliminación', 'Solicitar la supresión definitiva de tu cuenta.'],
          ]}
        />
      </Section>

      <Section title="Cookies y preferencias">
        <p>
          Usamos cookies esenciales para mantener tu sesión activa, recordar ajustes y analizar el rendimiento.
          Puedes gestionar tus preferencias desde la configuración del navegador. No utilizamos cookies con fines publicitarios.
        </p>
      </Section>

      <Section title="Cambios y contacto" icon={Mail}>
        <p className="mb-4">
          Te avisaremos mediante notificaciones in-app o correo cuando haya cambios relevantes. Para dudas o solicitudes:
        </p>
        <div className="rounded-2xl border border-outline/30 bg-surface-muted px-4 py-3 text-sm text-content">
          <p><strong>Email:</strong> privacy@eventscatch.com</p>
          <p><strong>Responsable:</strong> Equipo EventsCatch</p>
          <p><strong>Tiempo de respuesta:</strong> Máximo 30 días naturales</p>
        </div>
      </Section>
    </div>
  </div>
);

const InfoList = ({ groups }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {groups.map(({ heading, bullets }) => (
      <div key={heading} className="space-y-2 rounded-2xl border border-outline/30 bg-surface-muted px-4 py-3">
        <h3 className="text-sm font-semibold text-content">{heading}</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-content-muted">
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const BulletedList = ({ intro, items }) => (
  <div className="space-y-3">
    <p>{intro}</p>
    <ul className="space-y-2 text-sm text-content">
      {items.map(([title, description]) => (
        <li key={title} className="rounded-2xl border border-outline/20 bg-surface-muted px-4 py-3">
          <span className="font-semibold text-content">{title}:</span>{' '}
          <span className="text-content-muted">{description}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default Privacy;
