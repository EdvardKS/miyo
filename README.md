# 🎉 Fiestas App - Aplicación de Compartir Fotos de Eventos

Aplicación web completa para crear y compartir fotos de fiestas y eventos en tiempo real. Desarrollada con Docker, Node.js/Express backend, React frontend y MongoDB.

## 🚀 Características Principales

- 📸 **Galería de fotos en tiempo real** - Sube y comparte fotos al instante
- 🎊 **Creación de eventos** - Organiza fiestas con fecha, ubicación y código de acceso
- 👥 **Sistema de seguimiento** - Sigue a otros usuarios y ve sus eventos
- 🔒 **Control de privacidad** - Eventos públicos/privados con códigos de acceso
- 📍 **Verificación de ubicación** - Solo los asistentes cercanos pueden subir fotos
- 💬 **Interacciones sociales** - Likes y comentarios en tiempo real
- 🏆 **Top de actividad** - Descubre los usuarios más activos
- 📱 **Diseño responsive** - Funciona perfectamente en móviles y desktop

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Git

## 🛠️ Instalación y Ejecución

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd fiestas-app
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tus configuraciones:
   ```env
   # MongoDB Configuration
   MONGO_ROOT_USERNAME=admin
   MONGO_ROOT_PASSWORD=tu_password_seguro
   MONGO_DATABASE=fiestas_db

   # JWT Configuration
   JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro_aqui
   JWT_EXPIRE=7d

   # Email Configuration (opcional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASS=tu_app_password_de_gmail
   ```

3. **Levantar la aplicación**
   ```bash
   docker-compose up --build
   ```

4. **Acceder a la aplicación**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## 🏗️ Arquitectura

### Backend (Node.js + Express)
- **Autenticación JWT** con registro y login de usuarios
- **API RESTful** para gestión de usuarios, fiestas y fotos
- **Socket.IO** para actualizaciones en tiempo real
- **MongoDB** con Mongoose ODM
- **Multer** para manejo de uploads de archivos
- **Validación** con express-validator
- **Seguridad** con helmet, rate limiting y bcrypt

### Frontend (React + Vite)
- **React Router** para navegación
- **React Query** para gestión de estado del servidor
- **React Hook Form** para formularios
- **Socket.IO Client** para tiempo real
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **React Hot Toast** para notificaciones

### Base de Datos (MongoDB)
- **Usuarios**: perfiles, seguidores, configuración de privacidad
- **Fiestas**: eventos con ubicación, fechas y participantes
- **Fotos**: media con likes, comentarios y metadatos

## 📁 Estructura del Proyecto

```
fiestas-app/
├── backend/                 # Servidor Node.js/Express
│   ├── models/             # Modelos de Mongoose
│   ├── routes/             # Rutas de la API
│   ├── middleware/         # Middleware de autenticación
│   ├── utils/              # Utilidades
│   ├── Dockerfile          # Configuración Docker
│   └── package.json        # Dependencias
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas principales
│   │   ├── contexts/       # Contextos de React
│   │   ├── services/       # Servicios API
│   │   └── utils/          # Utilidades
│   ├── Dockerfile          # Configuración Docker
│   ├── nginx.conf          # Configuración Nginx
│   └── package.json        # Dependencias
├── docker-compose.yml      # Orquestación Docker
├── .env.example           # Variables de entorno ejemplo
└── README.md              # Este archivo
```

## 🔧 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener perfil actual
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/password` - Cambiar contraseña

### Usuarios
- `GET /api/users/search?q=...` - Buscar usuarios
- `GET /api/users/:username` - Obtener perfil de usuario
- `POST /api/users/:username/follow` - Seguir usuario
- `DELETE /api/users/:username/follow` - Dejar de seguir
- `GET /api/users/top/activity` - Top usuarios activos

### Fiestas
- `POST /api/parties` - Crear fiesta
- `GET /api/parties/:code` - Obtener fiesta por código
- `POST /api/parties/:code/join` - Unirse a fiesta
- `DELETE /api/parties/:code/leave` - Abandonar fiesta
- `GET /api/parties/feed` - Feed de fiestas
- `GET /api/parties/my/parties` - Mis fiestas

### Fotos
- `POST /api/photos/:partyCode/upload` - Subir foto
- `GET /api/photos/party/:partyCode` - Fotos de fiesta
- `POST /api/photos/:photoId/like` - Dar like
- `POST /api/photos/:photoId/comment` - Comentar foto
- `PATCH /api/photos/:photoId/hide` - Ocultar foto (creador)

## 🎯 Flujo de Usuario

1. **Registro/Login**: Los usuarios crean cuenta con email, username y password
2. **Explorar**: Ven el feed con fiestas de usuarios que siguen
3. **Top**: Descubren usuarios públicos con más actividad
4. **Crear Fiesta**: Organizan eventos con título, fechas y ubicación
5. **Unirse**: Acceden con código o invitación a fiestas privadas
6. **Compartir**: Suben fotos/videos si están cerca de la ubicación
7. **Interactuar**: Dan likes y comentan fotos en tiempo real
8. **Perfil**: Gestionan su información y configuración de privacidad

## 🔐 Seguridad

- **Passwords encriptados** con bcrypt
- **Tokens JWT** para autenticación
- **Rate limiting** para prevenir abusos
- **Validación de inputs** en todos los endpoints
- **CORS** configurado
- **Helmet** para headers de seguridad

## 🌐 Funcionalidades en Tiempo Real

- **Nuevas fotos** aparecen instantáneamente
- **Contadores de likes** se actualizan en vivo
- **Comentarios** se muestran al momento
- **Participantes** se unen/salen en tiempo real

## 📱 Características Móviles

- **Diseño responsive** adaptado a móviles
- **Navegación táctil** optimizada
- **Cámara integrada** para subir fotos
- **Geolocalización** para verificar asistencia
- **PWA ready** para instalación nativa

## 🚀 Despliegue

La aplicación está lista para despliegue en producción:

```bash
# Para producción
docker-compose -f docker-compose.yml up --build -d
```

## 🤝 Contribuir

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT License - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte o preguntas, contacta a [tu-email@dominio.com](mailto:tu-email@dominio.com)

---

**¡Disfruta compartiendo tus fiestas! 🎉**