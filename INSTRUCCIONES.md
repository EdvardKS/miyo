# 📋 Instrucciones Detalladas de Uso

## 🚀 Puesta en Marcha Rápida

### 1. Configuración Inicial

```bash
# 1. Copiar archivo de entorno
cp .env.example .env

# 2. Editar el archivo .env con tus datos
nano .env
```

**Configuración mínima requerida en .env:**
```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123456
MONGO_DATABASE=fiestas_db
JWT_SECRET=secreto_super_largo_y_unico_para_jwt_123456789
JWT_EXPIRE=7d
```

### 2. Levantar la Aplicación

```bash
# Un solo comando para levantar todo
docker-compose up --build
```

**El proceso tomará varios minutos la primera vez:**
- Descarga de imágenes Docker
- Construcción de imágenes personalizadas
- Inicialización de base de datos
- Configuración de servicios

### 3. Verificar Funcionamiento

Una vez iniciado, verifica que todo funcione:

- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:5000/api/health
- **Sin errores en los logs** de Docker

## 🎯 Flujo Completo de Uso

### Registro y Primeros Pasos

1. **Crear cuenta de usuario**
   - Email válido
   - Username único (3-30 caracteres, alfanumérico)
   - Password (mínimo 6 caracteres)

2. **Configurar perfil**
   - Foto de avatar (opcional)
   - Biografía (opcional)
   - Configuración de privacidad:
     - Perfil público: cualquiera puede ver tus eventos
     - Figura pública: aparece en el top de actividad

### Crear una Fiesta

1. **Datos básicos**
   - Título de la fiesta (obligatorio)
   - Descripción (opcional)
   - Fecha y hora de inicio
   - Fecha y hora de fin

2. **Ubicación**
   - Nombre del lugar
   - Dirección completa
   - Coordenadas GPS (automáticas o manuales)

3. **Privacidad**
   - **Pública**: cualquiera con el código puede unirse
   - **Privada**: solo invitados pueden acceder
   - **Código único**: generado automáticamente (6 caracteres)

### Unirse a una Fiesta

**Métodos de acceso:**
1. **Código directo**: Ingresa el código de 6 caracteres
2. **Invitación por email**: Recibe un enlace único de un solo uso
3. **Enlace compartido**: Acceso directo pero solo para visualización

### Subir Fotos

**Requisitos para subir fotos:**
1. **Ser participante** de la fiesta
2. **Estar en el rango de ubicación** (5km por defecto)
3. **La fiesta debe estar activa** (dentro de las fechas)
4. **Formatos permitidos**: JPG, PNG, GIF, MP4, MOV
5. **Tamaño máximo**: 10MB

**Proceso de subida:**
1. Tomar foto o seleccionar del dispositivo
2. Aplicar filtros (opcional)
3. Añadir descripción (opcional)
4. La foto aparece instantáneamente en la galería

### Interacciones Sociales

**Likes:**
- Click en corazón para dar/quitar like
- Contador se actualiza en tiempo real
- Puedes ver quién dio like

**Comentarios:**
- Máximo 500 caracteres por comentario
- Aparecen instantáneamente
- Solo el autor puede editar sus comentarios

## 🔧 Configuración Avanzada

### Variables de Entorno Opcionales

```env
# Configuración de Email (para recuperación de contraseña)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail

# Configuración de Archivos
MAX_FILE_SIZE=10485760          # 10MB en bytes
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,mp4,mov
UPLOAD_PATH=/app/uploads

# Configuración de Seguridad
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000     # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100
```

### Configuración de Gmail para Emails

1. **Activar 2FA** en tu cuenta Gmail
2. **Generar App Password**:
   - Ve a Configuración > Seguridad
   - Contraseñas de aplicaciones
   - Genera nueva contraseña para "Fiestas App"
3. **Usa esa contraseña** en `EMAIL_PASS`

### Personalización de la Aplicación

**Modificar colores principales:**
- Edita `frontend/tailwind.config.js`
- Cambia la paleta de colores `primary`

**Modificar textos y mensajes:**
- Revisa los archivos de componentes en `frontend/src/components/`
- Los textos están en español por defecto

## 🐥 Solución de Problemas

### Problemas Comunes

**1. Los contenedores no inician:**
```bash
# Limpiar y reconstruir
docker-compose down -v
docker-compose up --build
```

**2. Error de conexión a MongoDB:**
- Verifica que `MONGO_ROOT_PASSWORD` no tenga caracteres especiales
- Asegúrate de que el puerto 27017 esté libre

**3. El frontend no carga:**
- Verifica que el puerto 3000 esté disponible
- Revisa los logs del contenedor frontend

**4. No se pueden subir fotos:**
- Verifica el directorio de uploads tiene permisos
- Revisa el tamaño máximo del archivo
- Confirma el formato es permitido

### Logs y Depuración

**Ver logs de todos los servicios:**
```bash
docker-compose logs -f
```

**Ver logs de un servicio específico:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

**Acceder a un contenedor:**
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
```

## 📱 Uso en Dispositivos Móviles

### Acceso Local
1. **Asegúrate** de que tu móvil y PC estén en la misma red WiFi
2. **Encuentra la IP local** de tu PC:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` o `ip addr`
3. **Accede desde el móvil**: `http://[TU_IP_LOCAL]:3000`

### Funciones Móviles
- **Cámara**: Usa la cámara del dispositivo para tomar fotos
- **Geolocalización**: Activa GPS para verificar ubicación
- **Notificaciones**: Activa notificaciones del navegador

## 🚀 Mejoras Futuras

### Características Planificadas
- [ ] Filtros de imagen avanzados
- [ ] Edición de videos
- [ ] Chat en tiempo real por fiesta
- [ ] Albums colaborativos
- [ ] Estadísticas de eventos
- [ ] Integración con redes sociales
- [ ] Modo offline
- [ ] Backup automático de fotos

### Optimizaciones
- [ ] CDN para archivos estáticos
- [ ] Caché de Redis
- [ ] Balanceo de carga
- [ ] Microservicios
- [ ] Tests automatizados

## 📞 Soporte Técnico

**Para reportar issues:**
1. Describe el problema detalladamente
2. Incluye logs de error
3. Especifica tu sistema operativo
4. Menciona la versión de Docker

**Contacto:**
- Email: soporte@fiestas-app.com
- GitHub Issues: [repository]/issues

---

**¡Gracias por usar Fiestas App! 🎉**