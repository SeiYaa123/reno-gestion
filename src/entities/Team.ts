import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './Employee';
import { Project } from './Project';

@Entity('teams')
export class Team {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	nom: string;

	@ManyToMany(() => Employee, (employee) => employee.equipes)
	membres?: Employee[];

	/** Chantier sur lequel l'équipe est actuellement affectée (optionnel). */
	@ManyToOne(() => Project, (project) => project.equipes, { nullable: true, onDelete: 'SET NULL' })
	chantier?: Project;
}
