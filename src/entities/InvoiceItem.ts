import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Invoice } from './Invoice';

/** Une ligne de devis/facture, ex: "Pose carrelage 30m²" x 1 à 1200€. */
@Entity('invoice_items')
export class InvoiceItem {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	description: string;

	@Column({ type: 'real', default: 1 })
	quantite: number;

	@Column({ nullable: true })
	unite?: string; // m2, heure, forfait, unité...

	@Column({ type: 'real' })
	prixUnitaire: number;

	@ManyToOne(() => Invoice, (invoice) => invoice.lignes, { onDelete: 'CASCADE' })
	@JoinColumn()
	facture: Invoice;
}
