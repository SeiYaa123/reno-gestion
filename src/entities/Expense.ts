import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './Project';
import { Client } from './Client';
import { Vendor } from './Vendor';

export enum ExpenseCategory {
	MATERIAUX = 'materiaux',
	MAIN_OEUVRE = 'main_oeuvre',
	LOCATION_MATERIEL = 'location_materiel',
	TRANSPORT = 'transport',
	SOUS_TRAITANCE = 'sous_traitance',
	AUTRE = 'autre'
}

/** Une dépense liée à un chantier (achat de matériaux, location d'outillage, sous-traitance...). */
@Entity('expenses')
export class Expense {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'text', default: ExpenseCategory.AUTRE })
	categorie: ExpenseCategory;

	@Column({ type: 'real' })
	montant: number;

	@Column({ type: 'date' })
	date: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@ManyToOne(() => Project, (project) => project.depenses, { onDelete: 'CASCADE' })
	@JoinColumn()
	chantier: Project;

	@ManyToOne(() => Client, (client) => client.depenses, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn()
	client?: Client;

	@ManyToOne(() => Vendor, (vendor) => vendor.depenses, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn()
	fournisseur?: Vendor;
}
