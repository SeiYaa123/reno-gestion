import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './Project';
import { Invoice } from './Invoice';
import { Expense } from './Expense';

export enum ClientType {
	PARTICULIER = 'particulier',
	PROFESSIONNEL = 'professionnel'
}

export enum ClientStatus {
	ACTIF = 'actif',
	ARCHIVE = 'archive'
}

@Entity('clients')
export class Client {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	nom: string;

	@Column({ nullable: true })
	email?: string;

	@Column({ nullable: true })
	telephone?: string;

	@Column({ nullable: true })
	adresse?: string;

	/** Numéro de TVA/BCE belge du client professionnel, ex: BE0123456789. Requis pour l'autoliquidation. */
	@Column({ nullable: true })
	numeroTva?: string;

	@Column({ type: 'text', nullable: true })
	notes?: string;

	@Column({ type: 'text', default: ClientType.PARTICULIER })
	type: ClientType;

	@Column({ type: 'text', default: ClientStatus.ACTIF })
	statut: ClientStatus;

	@Column({ type: 'datetime', default: () => "datetime('now')" })
	createdAt: Date;

	@OneToMany(() => Project, (project) => project.client)
	chantiers?: Project[];

	@OneToMany(() => Invoice, (invoice) => invoice.client)
	factures?: Invoice[];

	@OneToMany(() => Expense, (expense) => expense.client)
	depenses?: Expense[];
}
