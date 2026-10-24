import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Invoice } from './Invoice';

export enum PaymentMode {
	VIREMENT = 'virement',
	BANCONTACT = 'bancontact',
	ESPECES = 'especes',
	CHEQUE = 'cheque',
	AUTRE = 'autre'
}

/** Un paiement (acompte ou solde) reçu pour une facture. Permet de suivre le solde restant dû. */
@Entity('payments')
export class Payment {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'real' })
	montant: number;

	@Column({ type: 'date' })
	date: string;

	@Column({ type: 'text', default: PaymentMode.VIREMENT })
	mode: PaymentMode;

	@Column({ type: 'text', nullable: true })
	notes?: string;

	@ManyToOne(() => Invoice, (invoice) => invoice.paiements, { onDelete: 'CASCADE' })
	@JoinColumn()
	facture: Invoice;
}
