import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Expense } from './Expense';

export enum VendorType {
	FOURNISSEUR = 'fournisseur',
	SOUS_TRAITANT = 'sous_traitant'
}

/**
 * Un fournisseur de matériaux ou un sous-traitant.
 * La distinction compte en Belgique : une facture reçue d'un sous-traitant assujetti pour des
 * travaux immobiliers relève en principe de l'autoliquidation (TVA à 0%, cocontractant).
 */
@Entity('vendors')
export class Vendor {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	nom: string;

	@Column({ type: 'text', default: VendorType.FOURNISSEUR })
	type: VendorType;

	@Column({ nullable: true })
	email?: string;

	@Column({ nullable: true })
	telephone?: string;

	/** Numéro de TVA/BCE belge, ex: BE0123456789. */
	@Column({ nullable: true })
	numeroTva?: string;

	/** ex: quincaillerie, électricité, plomberie, location d'engins... */
	@Column({ nullable: true })
	categorie?: string;

	@Column({ type: 'text', nullable: true })
	notes?: string;

	@OneToMany(() => Expense, (expense) => expense.fournisseur)
	depenses?: Expense[];
}
