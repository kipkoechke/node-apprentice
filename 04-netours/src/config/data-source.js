"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
var dotenv = __importStar(require("dotenv"));
var typeorm_1 = require("typeorm");
var configuration_1 = __importDefault(require("./configuration"));
dotenv.config();
var config = (0, configuration_1.default)();
var isDevelopment = process.env.NODE_ENV !== 'production';
var dataSourceOptions = {
    type: 'postgres',
    url: config.DATABASE.url,
    host: config.DATABASE.host,
    port: config.DATABASE.port,
    username: config.DATABASE.username,
    password: config.DATABASE.password,
    database: config.DATABASE.database,
    entities: [
        isDevelopment
            ? 'src/modules/**/entities/*.entity.ts'
            : 'dist/modules/**/entities/*.entity.js',
    ],
    migrations: [isDevelopment ? 'src/migrations/*.ts' : 'dist/migrations/*.js'],
    synchronize: true,
};
exports.dataSourceOptions = dataSourceOptions;
var dataSource = new typeorm_1.DataSource(dataSourceOptions);
console.log('Entities:', dataSourceOptions.entities);
console.log('Migrations:', dataSourceOptions.migrations);
exports.default = dataSource;
