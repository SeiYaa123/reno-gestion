import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from './Client';
import { Project } from './Project';
import { InvoiceItem } from './InvoiceItem';
import { Payment } from './Payment';

/**
 * Régime de TVA belge applicable au document.
 * - normal : TVA standard (généralement 21%).
 * - reduit_6 : taux réduit rénovation logement privé de plus de 10 ans (le client doit fournir
 *   une attestation, voir `attestationTva6`).
 * - cocontractant : autoliquidation pour travaux immobiliers entre assujettis (sous-traitance BTP) —
 *   TVA à 0%, mention légale obligatoire "Autoliquidation - Taxe à acquitter par le preneur,
 *   AR n°1, art. 20".
 */
export enum InvoiceVatRegime {
	NORMAL = 'normal',
	REDUIT_6 = 'reduit_6',
	COCONTRACTANT = 'cocontractant'
}

/**
 * Statut du document. Un devis accepté peut être converti en facture (voir `estCeUnDevis`),
 * en reprenant le même numéro de suivi `devisOrigineId`.
 */
export enum InvoiceStatus {
	BROUILLON = 'brouillon',
	ENVOYE = 'envoye',
	ACCEPTE = 'accepte', // devis uniquement
	REFUSE = 'refuse', // devis uniquement
	PAYE = 'paye', // facture uniquement
	EN_RETARD = 'en_retard', // facture uniquement
	ANNULE = 'annule'
}

/**
 * Un devis et une facture partagent la même structure (client, chantier, lignes, montants) ;
 * `estCeUnDevis` distingue les deux, comme dans la plupart des logiciels de gestion de chantier.
 */
@Entity('invoices')
export class Invoice {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	/** Numéro affiché au client, ex: "DEV-2026-001" ou "FAC-2026-014". */
	@Column({ unique: true })
	numero: string;

	@Column({ type: 'boolean', default: false })
	estCeUnDevis: boolean;

	/** Si cette facture provient d'un devis accepté, référence le devis d'origine. */
	@Column({ nullable: true })
	devisOrigineId?: string;

	@Column({ type: 'date' })
	dateEmission: string;

	@Column({ type: 'date', nullable: true })
	dateEcheance?: string;

	@Column({ type: 'text', default: InvoiceStatus.BROUILLON })
	statut: InvoiceStatus;

	/** Taux de TVA appliqué, ex: 21 pour 21%. Mis à 0 en pratique pour le régime cocontractant. */
	@Column({ type: 'real', default: 21 })
	tauxTva: number;

	@Column({ type: 'text', default: InvoiceVatRegime.NORMAL })
	regimeTva: InvoiceVatRegime;

	/** Atteste que le logement a plus de 10 ans (condition du taux réduit 6%). */
	@Column({ type: 'boolean', default: false })
	attestationTva6: boolean;

	/** Remise globale en montant (pas en %), appliquée avant TVA. */
	@Column({ type: 'real', default: 0 })
	remise: number;

	@Column({ type: 'text', nullable: true })
	notes?: string;

	@ManyToOne(() => Client, (client) => client.factures, { onDelete: 'SET NULL' })
	@JoinColumn()
	client?: Client;

	@ManyToOne(() => Project, (project) => project.factures, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn()
	chantier?: Project;

	// orphanedRowAction: 'delete' — une ligne retirée du tableau lors d'une modification est
	// supprimée en base plutôt que laissée orpheline (nécessite que `existing.lignes` soit chargé
	// avant le merge, voir routes/crud.ts).
	@OneToMany(() => InvoiceItem, (item) => item.facture, { cascade: true, orphanedRowAction: 'delete' })
	lignes?: InvoiceItem[];

	@OneToMany(() => Payment, (payment) => payment.facture)
	paiements?: Payment[];
}
