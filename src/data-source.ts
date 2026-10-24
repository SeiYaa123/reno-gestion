import 'reflect-metadata';
import path from 'node:path';
import { DataSource } from 'typeorm';
import { Client } from './entities/Client';
import { Employee } from './entities/Employee';
import { Team } from './entities/Team';
import { Project } from './entities/Project';
import { Task } from './entities/Task';
import { Invoice } from './entities/Invoice';
import { InvoiceItem } from './entities/InvoiceItem';
import { Expense } from './entities/Expense';
import { Equipment } from './entities/Equipment';
import { Vendor } from './entities/Vendor';
import { Payment } from './entities/Payment';
import { Settings } from './entities/Settings';

// Dans l'app Electron packagée, main.js fixe RENO_GESTION_DATA_DIR vers le dossier de données
// utilisateur (app.getPath('userData')) : le cwd d'un .exe installé n'est pas fiable. Sans cette
// variable (déploiement Node simple), le fichier reste à côté de l'app comme avant.
const dbPath = process.env.RENO_GESTION_DATA_DIR
	? path.join(process.env.RENO_GESTION_DATA_DIR, 'reno-gestion.sqlite')
	: 'reno-gestion.sqlite';

export const AppDataSource = new DataSource({
	type: 'better-sqlite3',
	database: dbPath,
	synchronize: true, // pas de migrations : usage local, le schéma se crée/ajuste automatiquement
	logging: false,
	entities: [Client, Employee, Team, Project, Task, Invoice, InvoiceItem, Expense, Equipment, Vendor, Payment, Settings]
});
