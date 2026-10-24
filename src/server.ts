import 'reflect-metadata';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import { crudRouter } from './routes/crud';
import { Client } from './entities/Client';
import { Employee } from './entities/Employee';
import { Team } from './entities/Team';
import { Project } from './entities/Project';
import { Task } from './entities/Task';
import { Invoice, InvoiceVatRegime } from './entities/Invoice';
import { InvoiceItem } from './entities/InvoiceItem';
import { Expense } from './entities/Expense';
import { Equipment } from './entities/Equipment';
import { Vendor } from './entities/Vendor';
import { Payment } from './entities/Payment';
import { Settings } from './entities/Settings';

const PORT = Number(process.env.PORT) || 3100;

async function main(): Promise<void> {
	await AppDataSource.initialize();

	const app = express();
	app.use(cors());
	app.use(express.json());

	// Aucune authentification : outil prévu pour un usage local uniquement.
	app.use('/api/clients', crudRouter(Client, { chantiers: true, factures: true }));
	app.use('/api/employees', crudRouter(Employee, { equipes: true }));
	app.use('/api/teams', crudRouter(Team, { membres: true, chantier: true }));
	app.use('/api/projects', crudRouter(Project, { client: true, taches: true, equipes: true }));
	app.use('/api/tasks', crudRouter(Task, { chantier: true, assigneA: true }));
	const invoiceRelations = { client: true, chantier: true, lignes: true, paiements: true } as const;

	// Route dédiée (avant le routeur générique, donc prioritaire) : remplace explicitement les
	// lignes plutôt que de compter sur la détection d'orphelins de TypeORM, peu fiable ici avec
	// repository.merge().
	app.put('/api/invoices/:id', async (req, res) => {
		const invoiceRepo = AppDataSource.getRepository(Invoice);
		const itemRepo = AppDataSource.getRepository(InvoiceItem);
		const existing = await invoiceRepo.findOne({ where: { id: req.params.id } });
		if (!existing) return res.status(404).json({ error: 'Introuvable' });

		const { lignes, ...rest } = req.body;
		invoiceRepo.merge(existing, rest);
		const saved = await invoiceRepo.save(existing);

		if (Array.isArray(lignes)) {
			await itemRepo.delete({ facture: { id: saved.id } } as any);
			const newItems = lignes.map((l: Partial<InvoiceItem>) => itemRepo.create({ ...l, facture: saved }));
			await itemRepo.save(newItems);
		}

		const full = await invoiceRepo.findOne({ where: { id: saved.id }, relations: invoiceRelations });
		res.json(full);
	});

	app.use('/api/invoices', crudRouter(Invoice, invoiceRelations));
	app.use('/api/expenses', crudRouter(Expense, { chantier: true, client: true, fournisseur: true }));
	app.use('/api/equipment', crudRouter(Equipment, { chantierActuel: true }));
	app.use('/api/vendors', crudRouter(Vendor));
	app.use('/api/payments', crudRouter(Payment, { facture: true }));

	// Réglages de l'entreprise : une seule ligne ('main'), pas de liste ni de suppression.
	app.get('/api/settings', async (_req, res) => {
		const repo = AppDataSource.getRepository(Settings);
		const settings = (await repo.findOne({ where: { id: 'main' } })) || repo.create({ id: 'main' });
		res.json(settings);
	});
	app.put('/api/settings', async (req, res) => {
		const repo = AppDataSource.getRepository(Settings);
		const existing = (await repo.findOne({ where: { id: 'main' } })) || repo.create({ id: 'main' });
		repo.merge(existing, req.body);
		res.json(await repo.save(existing));
	});

	// Calcule les totaux d'un devis/facture (sous-total, remise, TVA, paiements, solde dû).
	app.get('/api/invoices/:id/totaux', async (req, res) => {
		const invoice = await AppDataSource.getRepository(Invoice).findOne({
			where: { id: req.params.id },
			relations: { lignes: true, paiements: true }
		});
		if (!invoice) return res.status(404).json({ error: 'Introuvable' });
		res.json(computeInvoiceTotals(invoice));
	});

	// Vue imprimable (HTML) d'un devis/facture avec les mentions légales belges requises.
	app.get('/api/invoices/:id/print', async (req, res) => {
		const invoice = await AppDataSource.getRepository(Invoice).findOne({
			where: { id: req.params.id },
			relations: { lignes: true, paiements: true, client: true, chantier: true }
		});
		if (!invoice) return res.status(404).send('Introuvable');
		const settings = (await AppDataSource.getRepository(Settings).findOne({ where: { id: 'main' } })) || new Settings();
		res.send(renderInvoicePrintHtml(invoice, settings));
	});

	app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

	// Interface web statique (HTML/CSS/JS vanilla), servie directement par cette même API.
	app.use(express.static(path.join(__dirname, '..', 'public')));

	app.listen(PORT, () => {
		console.log(`reno-gestion API lancée sur http://localhost:${PORT}`);
	});
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

function computeInvoiceTotals(invoice: Invoice) {
	const sousTotal = (invoice.lignes || []).reduce((sum, ligne) => sum + ligne.quantite * ligne.prixUnitaire, 0);
	const apresRemise = Math.max(sousTotal - invoice.remise, 0);
	const montantTva = apresRemise * (invoice.tauxTva / 100);
	const total = apresRemise + montantTva;
	const montantPaye = (invoice.paiements || []).reduce((sum, p) => sum + p.montant, 0);
	const soldeDu = round2(total - montantPaye);

	return {
		sousTotal: round2(sousTotal),
		remise: round2(invoice.remise),
		apresRemise: round2(apresRemise),
		tauxTva: invoice.tauxTva,
		montantTva: round2(montantTva),
		total: round2(total),
		montantPaye: round2(montantPaye),
		soldeDu
	};
}

/** Mention légale belge requise selon le régime de TVA appliqué au document. */
function mentionTva(invoice: Invoice): string {
	if (invoice.regimeTva === InvoiceVatRegime.COCONTRACTANT) {
		return 'Autoliquidation — Taxe à acquitter par le preneur (Arrêté royal n°1, art. 20, Code TVA).';
	}
	if (invoice.regimeTva === InvoiceVatRegime.REDUIT_6) {
		return invoice.attestationTva6
			? 'TVA à 6% appliquée conformément à l\'attestation du client (logement privé de plus de 10 ans, AR n°20, tableau A, rubrique XXXVIII).'
			: 'Attention : taux réduit 6% appliqué SANS attestation client enregistrée — à régulariser.';
	}
	return '';
}

function escapeHtml(value: unknown): string {
	return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

function renderInvoicePrintHtml(invoice: Invoice, settings: Settings): string {
	const totals = computeInvoiceTotals(invoice);
	const titre = invoice.estCeUnDevis ? 'Devis' : 'Facture';
	const mention = mentionTva(invoice);

	const lignesHtml = (invoice.lignes || [])
		.map(
			(l) => `
			<tr>
				<td>${escapeHtml(l.description)}</td>
				<td style="text-align:right">${l.quantite} ${escapeHtml(l.unite || '')}</td>
				<td style="text-align:right">${l.prixUnitaire.toFixed(2)} €</td>
				<td style="text-align:right">${(l.quantite * l.prixUnitaire).toFixed(2)} €</td>
			</tr>`
		)
		.join('');

	const paiementsHtml = (invoice.paiements || [])
		.map((p) => `<tr><td>${p.date}</td><td>${escapeHtml(p.mode)}</td><td style="text-align:right">${p.montant.toFixed(2)} €</td></tr>`)
		.join('');

	return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>${titre} ${escapeHtml(invoice.numero)}</title>
<style>
	body { font-family: 'Open Sans', Arial, sans-serif; color: #1a2138; max-width: 760px; margin: 40px auto; font-size: 14px; }
	.header { display: flex; justify-content: space-between; margin-bottom: 30px; }
	.header h1 { font-size: 22px; margin: 0 0 4px; color: #3366ff; }
	.box { border: 1px solid #e4e9f2; border-radius: 8px; padding: 14px 16px; }
	table { width: 100%; border-collapse: collapse; margin-top: 18px; }
	th, td { padding: 8px 6px; border-bottom: 1px solid #edf1f7; text-align: left; font-size: 13px; }
	th { color: #8f9bb3; text-transform: uppercase; font-size: 11px; }
	.totals { margin-top: 14px; width: 280px; margin-left: auto; }
	.totals div { display: flex; justify-content: space-between; padding: 3px 0; }
	.totals .final { font-weight: 700; font-size: 16px; color: #3366ff; border-top: 1px solid #e4e9f2; margin-top: 6px; padding-top: 8px; }
	.mention { margin-top: 24px; padding: 10px 14px; background: #fff6e5; border-radius: 6px; font-size: 12.5px; color: #946200; }
	.footer { margin-top: 36px; font-size: 11.5px; color: #8f9bb3; border-top: 1px solid #edf1f7; padding-top: 10px; }
	@media print { body { margin: 0; } }
</style>
</head>
<body>
	<div class="header">
		<div>
			<img src="/assets/logo.png" alt="${escapeHtml(settings.nomEntreprise || 'Logo')}" style="height:36px;margin-bottom:8px;display:block;" />
			<div>${escapeHtml(settings.adresse)}</div>
			<div>${settings.numeroTva ? 'TVA ' + escapeHtml(settings.numeroTva) : ''}</div>
			<div>${escapeHtml(settings.telephone)} ${settings.email ? '— ' + escapeHtml(settings.email) : ''}</div>
		</div>
		<div class="box">
			<strong>${titre} n° ${escapeHtml(invoice.numero)}</strong><br/>
			Date d'émission : ${escapeHtml(invoice.dateEmission)}<br/>
			${invoice.dateEcheance ? `Échéance : ${escapeHtml(invoice.dateEcheance)}<br/>` : ''}
			${invoice.chantier ? `Chantier : ${escapeHtml(invoice.chantier.nom)}<br/>` : ''}
		</div>
	</div>

	${
		invoice.client
			? `<div class="box">
		<strong>Client</strong><br/>
		${escapeHtml(invoice.client.nom)}<br/>
		${escapeHtml(invoice.client.adresse)}<br/>
		${invoice.client.numeroTva ? 'TVA ' + escapeHtml(invoice.client.numeroTva) : ''}
	</div>`
			: ''
	}

	<table>
		<thead><tr><th>Description</th><th style="text-align:right">Quantité</th><th style="text-align:right">Prix unit.</th><th style="text-align:right">Total</th></tr></thead>
		<tbody>${lignesHtml}</tbody>
	</table>

	<div class="totals">
		<div><span>Sous-total</span><span>${totals.sousTotal.toFixed(2)} €</span></div>
		${invoice.remise ? `<div><span>Remise</span><span>-${totals.remise.toFixed(2)} €</span></div>` : ''}
		<div><span>TVA (${invoice.tauxTva}%)</span><span>${totals.montantTva.toFixed(2)} €</span></div>
		<div class="final"><span>Total</span><span>${totals.total.toFixed(2)} €</span></div>
		${
			(invoice.paiements || []).length
				? `<div><span>Déjà payé</span><span>-${totals.montantPaye.toFixed(2)} €</span></div>
			<div class="final"><span>Solde dû</span><span>${totals.soldeDu.toFixed(2)} €</span></div>`
				: ''
		}
	</div>

	${
		(invoice.paiements || []).length
			? `<table><thead><tr><th>Date</th><th>Mode</th><th style="text-align:right">Montant</th></tr></thead><tbody>${paiementsHtml}</tbody></table>`
			: ''
	}

	${mention ? `<div class="mention">${escapeHtml(mention)}</div>` : ''}

	<div class="footer">
		${settings.iban ? `IBAN : ${escapeHtml(settings.iban)}<br/>` : ''}
		${settings.conditionsPaiement ? escapeHtml(settings.conditionsPaiement) : ''}
	</div>

	<script>window.onload = () => window.print();</script>
</body>
</html>`;
}

main().catch((error) => {
	console.error('Échec du démarrage:', error);
	process.exit(1);
});
