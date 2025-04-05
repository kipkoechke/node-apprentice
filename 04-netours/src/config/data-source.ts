import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import configuration from './configuration';
dotenv.config();

const config = configuration();
const isDevelopment = process.env.NODE_ENV !== 'production';
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: config.DATABASE.host,
  port: config.DATABASE.port,
  username: config.DATABASE.username,
  password: config.DATABASE.password,
  database: config.DATABASE.database,
  entities: [
    isDevelopment
      ? 'src/modules/**/entities/*.entity.ts'
      : 'dist/src/modules/**/entities/*.entity.js',
  ],
  migrations: [
    isDevelopment ? 'src/migrations/*.ts' : 'dist/src/migrations/*.js',
  ],
  synchronize: isDevelopment ? true : false,
};

const dataSource = new DataSource(dataSourceOptions);

console.log('Entities:', dataSourceOptions.entities);
console.log('Migrations:', dataSourceOptions.migrations);

export default dataSource;
export { dataSourceOptions };
