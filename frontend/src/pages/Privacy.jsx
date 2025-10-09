import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, User, Mail, Phone } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Shield className="h-8 w-8 mr-2 text-primary-500" />
          Política de Privacidad
        </h1>
        <p className="text-gray-600">
          Tu privacidad es importante para nosotros. Esta política explica cómo recopilamos, usamos y protegemos tu información.
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="h-6 w-6 mr-2 text-primary-500" />
              Información que Recopilamos
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Información de Cuenta:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Email y username</li>
                  <li>Contraseña encriptada</li>
                  <li>Foto de perfil (opcional)</li>
                  <li>Biografía y preferencias de privacidad</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Información de Eventos:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Fiestas que creas y participes</li>
                  <li>Fotos y videos que subas</li>
                  <li>Ubicación de eventos</li>
                  <li>Comentarios y likes</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Información Técnica:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Dirección IP</li>
                  <li>Tipo de dispositivo y navegador</li>
                  <li>Datos de uso de la aplicación</li>
                  <li>Ubicación geográfica aproximada</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="h-6 w-6 mr-2 text-primary-500" />
              Cómo Usamos tu Información
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>Utilizamos tu información para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Proporcionar el servicio:</strong> Crear y gestionar tu cuenta, eventos y fotos</li>
                <li><strong>Mejorar la experiencia:</strong> Personalizar contenido y sugerir eventos relevantes</li>
                <li><strong>Comunicación:</strong> Enviar notificaciones importantes sobre tu cuenta</li>
                <li><strong>Seguridad:</strong> Proteger contra fraudes y abusos</li>
                <li><strong>Análisis:</strong> Entender cómo usamos la aplicación para mejorarla</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-6 w-6 mr-2 text-primary-500" />
              Control de tu Información
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>Tienes control completo sobre tu información:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Perfil público/privado:</strong> Elige quién puede ver tu información</li>
                <li><strong>Eventos privados:</strong> Controla quién puede acceder a tus fiestas</li>
                <li><strong>Fotos:</strong> Puedes eliminar o ocultar tus fotos en cualquier momento</li>
                <li><strong>Seguimiento:</strong> Acepta o rechaza solicitudes de seguimiento</li>
                <li><strong>Eliminar cuenta:</strong> Puedes solicitar la eliminación de tu cuenta y datos</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Seguridad de tus Datos</h2>
            <div className="space-y-3 text-gray-700">
              <p>Implementamos medidas de seguridad robustas:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encriptación de contraseñas con bcrypt</li>
                <li>Conexiones HTTPS seguras</li>
                <li>Autenticación con tokens JWT</li>
                <li>Limitación de tasa de solicitudes</li>
                <li>Validación estricta de datos</li>
                <li>Backups regulares y seguros</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Compartir Información</h2>
            <div className="space-y-3 text-gray-700">
              <p>No vendemos tu información a terceros. Solo compartimos datos cuando:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Consentimiento explícito:</strong> Cuando tú lo autorizas</li>
                <li><strong>Requisitos legales:</strong> Cuando la ley nos obliga</li>
                <li><strong>Proveedores de servicios:</strong> Con empresas que nos ayudan a operar (hosting, analytics)</li>
                <li><strong>Transferencia de negocio:</strong> En caso de venta o fusión (con protección de datos)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tus Derechos</h2>
            <div className="space-y-3 text-gray-700">
              <p>Tienes derecho a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Acceder:</strong> Saber qué información tenemos sobre ti</li>
                <li><strong>Rectificar:</strong> Corregir información incorrecta</li>
                <li><strong>Eliminar:</strong> Solicitar eliminación de tus datos</li>
                <li><strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerte a ciertos usos de tus datos</li>
                <li><strong>Restricción:</strong> Limitar el procesamiento de tus datos</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Retención de Datos</h2>
            <div className="space-y-3 text-gray-700">
              <p>Conservamos tu información solo el tiempo necesario:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cuentas activas:</strong> Mientras uses el servicio</li>
                <li><strong>Cuentas inactivas:</strong> 2 años, luego eliminamos datos personales</li>
                <li><strong>Eventos finalizados:</strong> 1 año después de finalizar</li>
                <li><strong>Registros del sistema:</strong> 6 meses para fines de seguridad</li>
                <li><strong>Requisitos legales:</strong> Según lo exija la ley</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies y Tecnologías Similares</h2>
            <div className="space-y-3 text-gray-700">
              <p>Usamos cookies para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mantener tu sesión activa</li>
                <li>Recordar tus preferencias</li>
                <li>Analizar el uso de la aplicación</li>
                <li>Mejorar el rendimiento</li>
              </ul>
              <p>Puedes controlar las cookies desde la configuración de tu navegador.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Menores de Edad</h2>
            <div className="space-y-3 text-gray-700">
              <p>Nuestro servicio está dirigido a mayores de 16 años. No recopilamos intencionadamente información de menores. Si descubrimos que hemos recopilado información de un menor, la eliminaremos inmediatamente.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cambios a esta Política</h2>
            <div className="space-y-3 text-gray-700">
              <p>Podemos actualizar esta política ocasionalmente. Te notificaremos cambios importantes mediante:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Notificación en la aplicación</li>
                <li>Email a usuarios registrados</li>
                <li>Aviso prominente en nuestro sitio</li>
              </ul>
              <p>El uso continuado de la aplicación después de cambios constituye aceptación de la nueva política.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-6 w-6 mr-2 text-primary-500" />
              Contacto
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>Para preguntas sobre esta política o ejercer tus derechos:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> privacy@fiestas-app.com</p>
                <p><strong>Responsable:</strong> Fiestas App</p>
                <p><strong>Dirección:</strong> [Tu dirección]</p>
                <p><strong>Teléfono:</strong> [Tu teléfono]</p>
              </div>
              <p>Responderemos a tu solicitud en un plazo máximo de 30 días.</p>
            </div>
          </section>

          <section className="border-t pt-6">
            <div className="text-center text-gray-600">
              <p className="mb-4">
                <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Volver al inicio
                </Link>
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Crear cuenta
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Privacy;