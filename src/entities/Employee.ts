import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Team } from './Team';
import { Task } from './Task';

export enum EmployeeStatus {
	ACTIF = 'actif',
	INACTIF = 'inactif'
}

@Entity('employees')
export class Employee {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	prenom: string;

	@Column()
	nom: string;

	@Column({ nullable: true })
	email?: string;

	@Column({ nullable: true })
	telephone?: string;

	/** ex: maçon, électricien, plombier, chef de chantier, peintre... */
	@Column({ nullable: true })
	metier?: string;

	@Column({ type: 'real', nullable: true })
	tauxHoraire?: number;

	@Column({ type: 'text', default: EmployeeStatus.ACTIF })
	statut: EmployeeStatus;

	@ManyToMany(() => Team, (team) => team.membres)
	@JoinTable({ name: 'employee_team' })
	equipes?: Team[];

	@OneToMany(() => Task, (task) => task.assigneA)
	tachesAssignees?: Task[];
}
