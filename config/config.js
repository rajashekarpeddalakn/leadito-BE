'use strict';

require('dotenv').config();

const base = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false
};

// If DATABASE_URL is set, Sequelize is constructed from the connection
// string instead (see models/index.js: config.use_env_variable). Hosted
// Postgres providers (Neon, Supabase, RDS) require SSL.
const useEnvVariable = process.env.DATABASE_URL ? 'DATABASE_URL' : undefined;
const sslOptions = process.env.DATABASE_URL
  ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
  : {};

module.exports = {
  development: { ...base, ...sslOptions, use_env_variable: useEnvVariable },
  test: {
    ...base,
    ...sslOptions,
    database: process.env.DB_NAME_TEST || `${base.database}_test`,
    use_env_variable: useEnvVariable
  },
  production: { ...base, ...sslOptions, use_env_variable: useEnvVariable }
};
