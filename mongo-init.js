// Script de inicialización para MongoDB
db = db.getSiblingDB('fiestas_db');

// Crear usuario de aplicación
db.createUser({
  user: 'fiestas_user',
  pwd: 'fiestas_password',
  roles: [
    {
      role: 'readWrite',
      db: 'fiestas_db'
    }
  ]
});

// Crear índices iniciales
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.parties.createIndex({ code: 1 }, { unique: true });
db.parties.createIndex({ createdAt: -1 });
db.photos.createIndex({ party: 1, createdAt: -1 });
db.photos.createIndex({ user: 1 });

print('Base de datos inicializada correctamente');