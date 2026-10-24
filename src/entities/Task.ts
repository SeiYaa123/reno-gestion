import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './Project';
import { Employee } from './Employee';

export enum TaskStatus {
	A_FAIRE = 'a_faire',
	EN_COURS = 'en_cours',
	TERMINEE = 'terminee',
	BLOQUEE = 'bloquee'
}

export enum TaskPriority {
	BASSE = 'basse',
	NORMALE = 'normale',
	HAUTE = 'haute',
	URGENTE = 'urgente'
}

/** Une tâche concrète d'un chantier, ex: "Démolition cloison", "Pose carrelage salle de bain". */
@Entity('tasks')
export class Task {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	titre: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'text', default: TaskStatus.A_FAIRE })
	statut: TaskStatus;

	@Column({ type: 'text', default: TaskPriority.NORMALE })
	priorite: TaskPriority;

	@Column({ type: 'date', nullable: true })
	dateEcheance?: string;

	@ManyToOne(() => Project, (project) => project.taches, { onDelete: 'CASCADE' })
	@JoinColumn()
	chantier: Project;

	@ManyToOne(() => Employee, (employee) => employee.tachesAssignees, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn()
	assigneA?: Employee;
}
