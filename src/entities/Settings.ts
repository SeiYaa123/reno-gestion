import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Informations légales de l'entreprise, utilisées sur les devis/factures imprimés.
 * Une seule ligne existe toujours (id fixe 'main') : pas de liste, juste un formulaire de réglages.
 */
@Entity('settings')
export class Settings {
	@PrimaryColumn({ default: 'main' })
	id: string;

	@Column({ nullable: true })
	nomEntreprise?: string;

	/** Numéro de TVA/BCE belge, ex: BE0123456789. */
	@Column({ nullable: true })
	numeroTva?: string;

	@Column({ nullable: true })
	adresse?: string;

	@Column({ nullable: true })
	telephone?: string;

	@Column({ nullable: true })
	email?: string;

	@Column({ nullable: true })
	iban?: string;

	/** ex: "Paiement à 30 jours, sans escompte." imprimé sur chaque devis/facture. */
	@Column({ type: 'text', nullable: true })
	conditionsPaiement?: string;
}
