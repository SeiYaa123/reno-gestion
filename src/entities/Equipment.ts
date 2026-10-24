import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './Project';

export enum EquipmentStatus {
	DISPONIBLE = 'disponible',
	EN_UTILISATION = 'en_utilisation',
	EN_MAINTENANCE = 'en_maintenance',
	HORS_SERVICE = 'hors_service'
}

/** Un outil ou une machine du matériel de l'entreprise (bétonnière, échafaudage, perceuse...). */
@Entity('equipment')
export class Equipment {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	nom: string;

	@Column({ nullable: true })
	categorie?: string;

	@Column({ nullable: true })
	numeroSerie?: string;

	@Column({ type: 'text', default: EquipmentStatus.DISPONIBLE })
	statut: EquipmentStatus;

	/** Chantier sur lequel l'équipement est actuellement affecté, si en utilisation. */
	@ManyToOne(() => Project, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn()
	chantierActuel?: Project;

	@Column({ type: 'text', nullable: true })
	notes?: string;
}
