// src/config/configuration.ts
export default () => ({
  // Application
  app: {
    port: parseInt(process.env.APP_PORT || '3000', 10),
    name: process.env.APP_NAME || 'Firewall Log Analyzer',
    env: process.env.NODE_ENV || 'development',
  },
  
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'firewall_logs_dev',
    synchronize: process.env.NODE_ENV !== 'production', // Auto-create tables in dev/test
    logging: process.env.DB_LOGGING === 'true',
  },
  
  // Security (for AuthModule later)
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
});