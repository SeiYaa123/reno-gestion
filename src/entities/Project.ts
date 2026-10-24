import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from './Client';
import { Task } from './Task';
import { Invoice } from './Invoice';
import { Expense } from './Expense';
import { Team } from './Team';

/** Statut d'un chantier, du devis accepté à la réception des travaux. */
export enum ProjectStatus {
	DEVIS = 'devis',
	PLANIFIE = 'planifie',
	EN_COURS = 'en_cours',
	EN_PAUSE = 'en_pause',
	TERMINE = 'termine',
	ANNULE = 'annule'
}

@Entity('projects')
export class Project {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	/** Nom du chantier, ex: "Rénovation cuisine - Dupont" */
	@Column()
	nom: string;

	@Column({ nullable: true })
	adresseChantier?: string;

	/** Commune bruxelloise/belge où se situe le chantier (utile pour les démarches d'urbanisme). */
	@Column({ nullable: true })
	commune?: string;

	/** Numéro du permis d'urbanisme ou de la déclaration de travaux, si applicable. */
	@Column({ nullable: true })
	numeroPermis?: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'text', default: ProjectStatus.DEVIS })
	statut: ProjectStatus;

	@Column({ type: 'date', nullable: true })
	dateDebut?: string;

	@Column({ type: 'date', nullable: true })
	dateFinPrevue?: string;

	@Column({ type: 'date', nullable: true })
	dateFinReelle?: string;

	/** Budget total estimé du chantier (toutes dépenses confondues). */
	@Column({ type: 'real', nullable: true })
	budget?: number;

	@ManyToOne(() => Client, (client) => client.chantiers, { onDelete: 'SET NULL' })
	@JoinColumn()
	client?: Client;

	@OneToMany(() => Task, (task) => task.chantier)
	taches?: Task[];

	@OneToMany(() => Invoice, (invoice) => invoice.chantier)
	factures?: Invoice[];

	@OneToMany(() => Expense, (expense) => expense.chantier)
	depenses?: Expense[];

	@OneToMany(() => Team, (team) => team.chantier)
	equipes?: Team[];
}
