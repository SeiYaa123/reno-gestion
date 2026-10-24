'use strict';

const API = '/api';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

async function fetchJSON(url, options) {
	const res = await fetch(url, options);
	if (!res.ok) {
		let message = `Erreur ${res.status}`;
		try {
			const body = await res.json();
			if (body.error) message = body.error;
		} catch {
			/* ignore */
		}
		throw new Error(message);
	}
	if (res.status === 204) return null;
	return res.json();
}

function getPath(obj, path) {
	return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function showToast(message, isError) {
	const toast = document.getElementById('toast');
	toast.textContent = message;
	toast.className = 'toast show' + (isError ? ' error' : '');
	clearTimeout(showToast._t);
	showToast._t = setTimeout(() => {
		toast.className = 'toast';
	}, 2600);
}

function fmtMoney(n) {
	if (n == null || n === '') return '—';
	return Number(n).toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function fmtDate(d) {
	if (!d) return '—';
	return d;
}

const BADGE_TONE = {
	// positif
	termine: 'success', terminee: 'success', accepte: 'success', paye: 'success', disponible: 'success', actif: 'success',
	// en cours / attention
	en_cours: 'warning', en_pause: 'warning', envoye: 'warning', en_utilisation: 'warning', planifie: 'warning', devis: 'neutral', brouillon: 'neutral', a_faire: 'neutral',
	// négatif
	annule: 'danger', bloquee: 'danger', refuse: 'danger', en_retard: 'danger', hors_service: 'danger', archive: 'danger', inactif: 'danger', en_maintenance: 'warning',
	haute: 'warning', urgente: 'danger', basse: 'neutral', normale: 'neutral',
	particulier: 'neutral', professionnel: 'neutral',
	fournisseur: 'neutral', sous_traitant: 'info',
	normal: 'neutral', reduit_6: 'warning', cocontractant: 'info'
};

function badge(value, labels) {
	if (value == null || value === '') return '—';
	const tone = BADGE_TONE[value] || 'neutral';
	const label = (labels && labels[value]) || value;
	return `<span class="badge badge-${tone}">${label}</span>`;
}

/* ------------------------------------------------------------------ */
/* Icônes SVG (remplacent les emoji)                                   */
/* ------------------------------------------------------------------ */

const ICON_PATHS = {
	dashboard: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/>',
	calendar: '<rect x="3" y="4" width="14" height="13" rx="1.5"/><line x1="3" y1="8" x2="17" y2="8"/><line x1="6.5" y1="2.5" x2="6.5" y2="5.5"/><line x1="13.5" y1="2.5" x2="13.5" y2="5.5"/>',
	projects: '<rect x="3" y="9" width="3" height="8"/><rect x="8.5" y="5" width="3" height="12"/><rect x="14" y="2" width="3" height="15"/>',
	tasks: '<rect x="3" y="3" width="14" height="14" rx="2"/><path d="M6 10l2.5 2.5L14 7"/>',
	invoices: '<rect x="4" y="2" width="12" height="16" rx="1"/><line x1="7" y1="6" x2="13" y2="6"/><line x1="7" y1="9" x2="13" y2="9"/><line x1="7" y1="12" x2="11" y2="12"/>',
	payments: '<rect x="2" y="5" width="16" height="11" rx="2"/><line x1="2" y1="9" x2="18" y2="9"/>',
	clients: '<circle cx="10" cy="7" r="3"/><path d="M4 17c0-3 2.5-5 6-5s6 2 6 5"/>',
	employees: '<path d="M4 13.5a6 6 0 0112 0"/><line x1="2" y1="13.5" x2="18" y2="13.5"/><line x1="10" y1="4" x2="10" y2="7"/>',
	teams: '<circle cx="6.8" cy="7" r="2.6"/><path d="M2.3 16c0-2.5 2-4.2 4.5-4.2s4.5 1.7 4.5 4.2"/><circle cx="14.2" cy="7" r="2.1"/><path d="M11.6 12c.5-.15.9-.2 1.4-.2 2.3 0 4.2 1.6 4.2 4.2"/>',
	expenses: '<circle cx="10" cy="10" r="7"/><path d="M12.6 7.2a4 4 0 100 5.6M6.5 8.6h4M6.5 11.4h4"/>',
	equipment: '<path d="M4.5 15.5l5-5"/><path d="M11.3 8.7a3 3 0 10-3-3 3 3 0 003 3z"/>',
	vendors: '<path d="M3 6.5l7-3.5 7 3.5-7 3.5-7-3.5z"/><path d="M3 6.5v7l7 3.5 7-3.5v-7"/><line x1="10" y1="10" x2="10" y2="17"/>',
	settings: '<line x1="3" y1="6" x2="17" y2="6"/><circle cx="12" cy="6" r="1.6"/><line x1="3" y1="10" x2="17" y2="10"/><circle cx="7" cy="10" r="1.6"/><line x1="3" y1="14" x2="17" y2="14"/><circle cx="14" cy="14" r="1.6"/>'
};

function svgIcon(name) {
	return `<svg class="icon" width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name] || ''}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Enum labels                                                         */
/* ------------------------------------------------------------------ */

const LABELS = {
	projectStatus: { devis: 'Devis', planifie: 'Planifié', en_cours: 'En cours', en_pause: 'En pause', termine: 'Terminé', annule: 'Annulé' },
	taskStatus: { a_faire: 'À faire', en_cours: 'En cours', terminee: 'Terminée', bloquee: 'Bloquée' },
	taskPriority: { basse: 'Basse', normale: 'Normale', haute: 'Haute', urgente: 'Urgente' },
	clientType: { particulier: 'Particulier', professionnel: 'Professionnel' },
	clientStatus: { actif: 'Actif', archive: 'Archivé' },
	employeeStatus: { actif: 'Actif', inactif: 'Inactif' },
	invoiceStatus: { brouillon: 'Brouillon', envoye: 'Envoyé', accepte: 'Accepté', refuse: 'Refusé', paye: 'Payé', en_retard: 'En retard', annule: 'Annulé' },
	expenseCategory: { materiaux: 'Matériaux', main_oeuvre: "Main d'œuvre", location_materiel: 'Location matériel', transport: 'Transport', sous_traitance: 'Sous-traitance', autre: 'Autre' },
	equipmentStatus: { disponible: 'Disponible', en_utilisation: 'En utilisation', en_maintenance: 'En maintenance', hors_service: 'Hors service' },
	vendorType: { fournisseur: 'Fournisseur', sous_traitant: 'Sous-traitant' },
	invoiceVatRegime: { normal: 'Normal (21%)', reduit_6: 'Réduit 6% — rénovation logement', cocontractant: 'Cocontractant — autoliquidation' },
	paymentMode: { virement: 'Virement', bancontact: 'Bancontact', especes: 'Espèces', cheque: 'Chèque', autre: 'Autre' }
};

function options(labelMap) {
	return Object.entries(labelMap).map(([value, label]) => ({ value, label }));
}

/* ------------------------------------------------------------------ */
/* Reference data cache (for relation selects)                         */
/* ------------------------------------------------------------------ */

const cache = { clients: [], projects: [], employees: [], vendors: [], invoices: [] };

async function refreshCache() {
	const [clients, projects, employees, vendors, invoices] = await Promise.all([
		fetchJSON(`${API}/clients`),
		fetchJSON(`${API}/projects`),
		fetchJSON(`${API}/employees`),
		fetchJSON(`${API}/vendors`),
		fetchJSON(`${API}/invoices`)
	]);
	cache.clients = clients;
	cache.projects = projects;
	cache.employees = employees;
	cache.vendors = vendors;
	cache.invoices = invoices;
}

/* ------------------------------------------------------------------ */
/* Generic CRUD section renderer                                       */
/* ------------------------------------------------------------------ */

function relationOptions(relationName) {
	const list = cache[relationName] || [];
	return list.map((item) => ({
		value: item.id,
		label:
			relationName === 'employees'
				? `${item.prenom} ${item.nom}`
				: relationName === 'invoices'
					? `${item.estCeUnDevis ? 'Devis' : 'Facture'} ${item.numero}`
					: item.nom || item.numero || item.id
	}));
}

function buildFieldHtml(field) {
	const id = `f_${field.key}`;
	if (field.type === 'select' || field.type === 'relation') {
		const opts = field.type === 'relation' ? relationOptions(field.relation) : field.options;
		const blank = field.required ? '' : `<option value="">—</option>`;
		return `
			<select id="${id}" name="${field.key}" ${field.required ? 'required' : ''}>
				${blank}
				${opts.map((o) => `<option value="${o.value}">${o.label}</option>`).join('')}
			</select>`;
	}
	if (field.type === 'textarea') {
		return `<textarea id="${id}" name="${field.key}" ${field.required ? 'required' : ''}></textarea>`;
	}
	if (field.type === 'checkbox') {
		return `<input id="${id}" name="${field.key}" type="checkbox" style="width:18px;height:18px;align-self:flex-start;" />`;
	}
	return `<input id="${id}" name="${field.key}" type="${field.type || 'text'}" step="${field.type === 'number' ? '0.01' : ''}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} />`;
}

function renderForm(section) {
	return `
		<form class="form-grid" id="form-${section.key}">
			${section.fields
				.map(
					(f) => `
				<div class="form-field ${f.span2 ? 'span-2' : ''}">
					<label for="f_${f.key}">${f.label}${f.required ? ' *' : ''}</label>
					${buildFieldHtml(f)}
				</div>`
				)
				.join('')}
			<div class="form-field span-2 form-actions" style="grid-column: 1/-1;">
				<button type="button" class="btn btn-ghost btn-cancel-edit" style="display:none;">Annuler</button>
				<button type="submit" class="btn btn-primary">Ajouter</button>
			</div>
		</form>`;
}

function renderTable(section, rows) {
	if (!rows.length) {
		return `<table><thead>${headRow(section)}</thead><tbody><tr class="empty-row"><td colspan="${section.columns.length + 1}">Aucune donnée pour le moment.</td></tr></tbody></table>`;
	}
	return `
		<table>
			<thead>${headRow(section)}</thead>
			<tbody>
				${rows
					.map(
						(row) => `
					<tr data-id="${row.id}">
						${section.columns
							.map((col) => `<td data-label="${col.label}">${col.render ? col.render(row) : getPath(row, col.key) ?? '—'}</td>`)
							.join('')}
						<td data-label="Actions">
							<button class="btn btn-ghost btn-small btn-edit" data-id="${row.id}">Modifier</button>
							<button class="btn btn-danger-ghost btn-small btn-delete" data-section="${section.key}" data-id="${row.id}">Supprimer</button>
						</td>
					</tr>`
					)
					.join('')}
			</tbody>
		</table>`;
}

function headRow(section) {
	return `<tr>${section.columns.map((c) => `<th>${c.label}</th>`).join('')}<th></th></tr>`;
}

function populateForm(section, form, row) {
	section.fields.forEach((field) => {
		const el = form.querySelector(`[name="${field.key}"]`);
		if (!el) return;
		if (field.type === 'relation') {
			el.value = (row[field.key] && row[field.key].id) || '';
		} else if (field.type === 'checkbox') {
			el.checked = !!row[field.key];
		} else {
			el.value = row[field.key] ?? '';
		}
	});
}

function enterEditMode(section, form, row) {
	form.dataset.editingId = row.id;
	populateForm(section, form, row);
	form.querySelector('button[type="submit"]').textContent = 'Enregistrer les modifications';
	form.querySelector('.btn-cancel-edit').style.display = '';
	document.getElementById(`panel-${section.key}`).querySelector('.card h2').textContent = `Modifier : ${section.title.replace(/^(Nouveau|Nouvelle|Nouvel)\s+/i, '')}`;
	form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function exitEditMode(section, form) {
	delete form.dataset.editingId;
	form.reset();
	form.querySelector('button[type="submit"]').textContent = 'Ajouter';
	form.querySelector('.btn-cancel-edit').style.display = 'none';
	document.getElementById(`panel-${section.key}`).querySelector('.card h2').textContent = section.title;
}

async function renderSection(section) {
	const panel = document.getElementById(`panel-${section.key}`);
	const form = panel.querySelector(`#form-${section.key}`);
	const rows = await fetchJSON(`${API}${section.apiPath}`);
	panel.querySelector('.table-holder').innerHTML = renderTable(section, rows);
	panel.querySelectorAll('.btn-edit').forEach((btn) => {
		btn.addEventListener('click', () => {
			const row = rows.find((r) => r.id === btn.dataset.id);
			if (row) enterEditMode(section, form, row);
		});
	});
	panel.querySelectorAll('.btn-delete').forEach((btn) => {
		btn.addEventListener('click', async () => {
			if (!confirm('Supprimer cet élément ?')) return;
			try {
				await fetchJSON(`${API}${section.apiPath}/${btn.dataset.id}`, { method: 'DELETE' });
				showToast('Supprimé.');
				if (form.dataset.editingId === btn.dataset.id) exitEditMode(section, form);
				await renderSection(section);
			} catch (err) {
				showToast(err.message, true);
			}
		});
	});
}

function buildPayload(section, formData) {
	const payload = {};
	for (const field of section.fields) {
		if (field.type === 'checkbox') {
			payload[field.key] = formData.get(field.key) === 'on';
			continue;
		}
		const raw = formData.get(field.key);
		if (raw === '' || raw == null) continue;
		if (field.type === 'relation') {
			payload[field.key] = { id: raw };
		} else if (field.type === 'number') {
			payload[field.key] = Number(raw);
		} else {
			payload[field.key] = raw;
		}
	}
	return payload;
}

function renderGenericPanel(section) {
	return `
		<div class="card">
			<h2>${section.title}</h2>
			<p class="subtitle">${section.subtitle || ''}</p>
			${renderForm(section)}
		</div>
		<div class="card">
			<h2>Liste</h2>
			<div class="table-holder"></div>
		</div>`;
}

async function initGenericSection(section) {
	const panel = document.getElementById(`panel-${section.key}`);
	panel.innerHTML = renderGenericPanel(section);
	const form = panel.querySelector(`#form-${section.key}`);
	form.querySelector('.btn-cancel-edit').addEventListener('click', () => exitEditMode(section, form));
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const payload = buildPayload(section, new FormData(form));
		const editingId = form.dataset.editingId;
		try {
			await fetchJSON(`${API}${section.apiPath}${editingId ? '/' + editingId : ''}`, {
				method: editingId ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			showToast(editingId ? 'Modifié avec succès.' : 'Ajouté avec succès.');
			exitEditMode(section, form);
			await refreshCache();
			await renderSection(section);
		} catch (err) {
			showToast(err.message, true);
		}
	});
	await renderSection(section);
}

/* ------------------------------------------------------------------ */
/* Section definitions                                                 */
/* ------------------------------------------------------------------ */

const SECTIONS = [
	{
		key: 'projects',
		label: 'Chantiers',
		title: 'Nouveau chantier',
		subtitle: 'Un chantier regroupe tâches, devis/factures et dépenses.',
		apiPath: '/projects',
		columns: [
			{ key: 'nom', label: 'Nom' },
			{ key: 'client.nom', label: 'Client' },
			{ key: 'statut', label: 'Statut', render: (r) => badge(r.statut, LABELS.projectStatus) },
			{ key: 'dateDebut', label: 'Début', render: (r) => fmtDate(r.dateDebut) },
			{ key: 'dateFinPrevue', label: 'Fin prévue', render: (r) => fmtDate(r.dateFinPrevue) },
			{ key: 'budget', label: 'Budget', render: (r) => fmtMoney(r.budget) }
		],
		fields: [
			{ key: 'nom', label: 'Nom du chantier', required: true, span2: true },
			{ key: 'client', label: 'Client', type: 'relation', relation: 'clients' },
			{ key: 'adresseChantier', label: 'Adresse du chantier', span2: true },
			{ key: 'commune', label: 'Commune' },
			{ key: 'numeroPermis', label: "Permis d'urbanisme n°" },
			{ key: 'statut', label: 'Statut', type: 'select', options: options(LABELS.projectStatus) },
			{ key: 'dateDebut', label: 'Date de début', type: 'date' },
			{ key: 'dateFinPrevue', label: 'Fin prévue', type: 'date' },
			{ key: 'budget', label: 'Budget (€)', type: 'number' },
			{ key: 'description', label: 'Description', type: 'textarea', span2: true }
		]
	},
	{
		key: 'tasks',
		label: 'Tâches',
		title: 'Nouvelle tâche',
		subtitle: 'Une tâche concrète à réaliser sur un chantier.',
		apiPath: '/tasks',
		columns: [
			{ key: 'titre', label: 'Titre' },
			{ key: 'chantier.nom', label: 'Chantier' },
			{ key: 'assigneA', label: 'Assignée à', render: (r) => (r.assigneA ? `${r.assigneA.prenom} ${r.assigneA.nom}` : '—') },
			{ key: 'statut', label: 'Statut', render: (r) => badge(r.statut, LABELS.taskStatus) },
			{ key: 'priorite', label: 'Priorité', render: (r) => badge(r.priorite, LABELS.taskPriority) },
			{ key: 'dateEcheance', label: 'Échéance', render: (r) => fmtDate(r.dateEcheance) }
		],
		fields: [
			{ key: 'titre', label: 'Titre de la tâche', required: true, span2: true },
			{ key: 'chantier', label: 'Chantier', type: 'relation', relation: 'projects', required: true },
			{ key: 'assigneA', label: 'Assignée à', type: 'relation', relation: 'employees' },
			{ key: 'statut', label: 'Statut', type: 'select', options: options(LABELS.taskStatus) },
			{ key: 'priorite', label: 'Priorité', type: 'select', options: options(LABELS.taskPriority) },
			{ key: 'dateEcheance', label: 'Échéance', type: 'date' },
			{ key: 'description', label: 'Description', type: 'textarea', span2: true }
		]
	},
	{
		key: 'clients',
		label: 'Clients',
		title: 'Nouveau client',
		subtitle: 'Particulier ou professionnel.',
		apiPath: '/clients',
		columns: [
			{ key: 'nom', label: 'Nom' },
			{ key: 'email', label: 'Email' },
			{ key: 'telephone', label: 'Téléphone' },
			{ key: 'type', label: 'Type', render: (r) => badge(r.type, LABELS.clientType) },
			{ key: 'statut', label: 'Statut', render: (r) => badge(r.statut, LABELS.clientStatus) }
		],
		fields: [
			{ key: 'nom', label: 'Nom', required: true, span2: true },
			{ key: 'type', label: 'Type de client', type: 'select', options: options(LABELS.clientType) },
			{ key: 'email', label: 'Email', type: 'email' },
			{ key: 'telephone', label: 'Téléphone' },
			{ key: 'numeroTva', label: 'N° TVA/BCE (si pro)', placeholder: 'BE0123456789' },
			{ key: 'adresse', label: 'Adresse', span2: true },
			{ key: 'notes', label: 'Notes', type: 'textarea', span2: true }
		]
	},
	{
		key: 'employees',
		label: 'Employés',
		title: 'Nouvel employé',
		subtitle: '',
		apiPath: '/employees',
		columns: [
			{ key: 'nomComplet', label: 'Nom', render: (r) => `${r.prenom} ${r.nom}` },
			{ key: 'metier', label: 'Métier' },
			{ key: 'tauxHoraire', label: 'Taux horaire', render: (r) => fmtMoney(r.tauxHoraire) },
			{ key: 'statut', label: 'Statut', render: (r) => badge(r.statut, LABELS.employeeStatus) }
		],
		fields: [
			{ key: 'prenom', label: 'Prénom', required: true },
			{ key: 'nom', label: 'Nom', required: true },
			{ key: 'metier', label: 'Métier (ex: maçon, électricien)' },
			{ key: 'tauxHoraire', label: 'Taux horaire (€)', type: 'number' },
			{ key: 'email', label: 'Email', type: 'email' },
			{ key: 'telephone', label: 'Téléphone' },
			{ key: 'statut', label: 'Statut', type: 'select', options: options(LABELS.employeeStatus) }
		]
	},
	{
		key: 'teams',
		label: 'Équipes',
		title: 'Nouvelle équipe',
		subtitle: 'Les membres se gèrent après création, via l’API (fonctionnalité simplifiée).',
		apiPath: '/teams',
		columns: [
			{ key: 'nom', label: 'Nom' },
			{ key: 'chantier.nom', label: 'Chantier' },
			{ key: 'membres', label: 'Membres', render: (r) => (r.membres || []).length }
		],
		fields: [
			{ key: 'nom', label: "Nom de l'équipe", required: true, span2: true },
			{ key: 'chantier', label: 'Chantier affecté', type: 'relation', relation: 'projects' }
		]
	},
	{
		key: 'payments',
		label: 'Paiements',
		title: 'Nouveau paiement',
		subtitle: 'Acompte ou solde reçu pour un devis/facture — pour suivre ce qui reste dû.',
		apiPath: '/payments',
		columns: [
			{ key: 'facture.numero', label: 'Devis/Facture' },
			{ key: 'montant', label: 'Montant', render: (r) => fmtMoney(r.montant) },
			{ key: 'date', label: 'Date', render: (r) => fmtDate(r.date) },
			{ key: 'mode', label: 'Mode', render: (r) => (LABELS.paymentMode[r.mode] || r.mode) }
		],
		fields: [
			{ key: 'facture', label: 'Devis/Facture', type: 'relation', relation: 'invoices', required: true, span2: true },
			{ key: 'montant', label: 'Montant (€)', type: 'number', required: true },
			{ key: 'date', label: 'Date', type: 'date', required: true },
			{ key: 'mode', label: 'Mode de paiement', type: 'select', options: options(LABELS.paymentMode) },
			{ key: 'notes', label: 'Notes', type: 'textarea', span2: true }
		]
	},
	{
		key: 'expenses',
		label: 'Dépenses',
		title: 'Nouvelle dépense',
		subtitle: 'Dépense liée à un chantier (matériaux, sous-traitance, location...).',
		apiPath: '/expenses',
		columns: [
			{ key: 'categorie', label: 'Catégorie', render: (r) => badge(r.categorie, LABELS.expenseCategory) },
			{ key: 'montant', label: 'Montant', render: (r) => fmtMoney(r.montant) },
			{ key: 'date', label: 'Date', render: (r) => fmtDate(r.date) },
			{ key: 'chantier.nom', label: 'Chantier' },
			{ key: 'fournisseur.nom', label: 'Fournisseur' }
		],
		fields: [
			{ key: 'categorie', label: 'Catégorie', type: 'select', options: options(LABELS.expenseCategory) },
			{ key: 'montant', label: 'Montant (€)', type: 'number', required: true },
			{ key: 'date', label: 'Date', type: 'date', required: true },
			{ key: 'chantier', label: 'Chantier', type: 'relation', relation: 'projects', required: true },
			{ key: 'fournisseur', label: 'Fournisseur / sous-traitant', type: 'relation', relation: 'vendors' },
			{ key: 'description', label: 'Description', type: 'textarea', span2: true }
		]
	},
	{
		key: 'equipment',
		label: 'Matériel',
		title: 'Nouvel équipement',
		subtitle: 'Outils et machines de l’entreprise.',
		apiPath: '/equipment',
		columns: [
			{ key: 'nom', label: 'Nom' },
			{ key: 'categorie', label: 'Catégorie' },
			{ key: 'statut', label: 'Statut', render: (r) => badge(r.statut, LABELS.equipmentStatus) },
			{ key: 'chantierActuel.nom', label: 'Chantier actuel' }
		],
		fields: [
			{ key: 'nom', label: 'Nom', required: true, span2: true },
			{ key: 'categorie', label: 'Catégorie' },
			{ key: 'numeroSerie', label: 'N° de série' },
			{ key: 'statut', label: 'Statut', type: 'select', options: options(LABELS.equipmentStatus) },
			{ key: 'chantierActuel', label: 'Chantier actuel', type: 'relation', relation: 'projects' },
			{ key: 'notes', label: 'Notes', type: 'textarea', span2: true }
		]
	},
	{
		key: 'vendors',
		label: 'Fournisseurs',
		title: 'Nouveau fournisseur / sous-traitant',
		subtitle: 'Un sous-traitant assujetti pour travaux immobiliers relève en général de l’autoliquidation.',
		apiPath: '/vendors',
		columns: [
			{ key: 'nom', label: 'Nom' },
			{ key: 'type', label: 'Type', render: (r) => badge(r.type, LABELS.vendorType) },
			{ key: 'email', label: 'Email' },
			{ key: 'telephone', label: 'Téléphone' },
			{ key: 'categorie', label: 'Catégorie' }
		],
		fields: [
			{ key: 'nom', label: 'Nom', required: true, span2: true },
			{ key: 'type', label: 'Type', type: 'select', options: options(LABELS.vendorType) },
			{ key: 'email', label: 'Email', type: 'email' },
			{ key: 'telephone', label: 'Téléphone' },
			{ key: 'numeroTva', label: 'N° TVA/BCE', placeholder: 'BE0123456789' },
			{ key: 'categorie', label: 'Catégorie' },
			{ key: 'notes', label: 'Notes', type: 'textarea', span2: true }
		]
	}
];

/* ------------------------------------------------------------------ */
/* Devis & Factures — rendu spécifique (lignes dynamiques + totaux)    */
/* ------------------------------------------------------------------ */

function calcTotals(lignes, remise, tauxTva, paiements) {
	const sousTotal = (lignes || []).reduce((sum, l) => sum + Number(l.quantite || 0) * Number(l.prixUnitaire || 0), 0);
	const apresRemise = Math.max(sousTotal - Number(remise || 0), 0);
	const montantTva = apresRemise * (Number(tauxTva || 0) / 100);
	const total = apresRemise + montantTva;
	const montantPaye = (paiements || []).reduce((sum, p) => sum + Number(p.montant || 0), 0);
	const soldeDu = total - montantPaye;
	return { sousTotal, apresRemise, montantTva, total, montantPaye, soldeDu };
}

function mentionTvaPreview(regime, attestation) {
	if (regime === 'cocontractant') return 'Mention requise : autoliquidation — TVA à acquitter par le preneur.';
	if (regime === 'reduit_6') {
		return attestation
			? 'Mention : TVA 6% — attestation client (logement > 10 ans) requise.'
			: '⚠ TVA 6% sans attestation enregistrée — à régulariser.';
	}
	return '';
}

function invoiceItemRowHtml(index) {
	return `
		<div class="item-row" data-index="${index}">
			<input placeholder="Description (ex: Pose carrelage)" class="li-desc" required />
			<input placeholder="Qté" type="number" step="0.01" class="li-qte" value="1" required />
			<input placeholder="Unité" class="li-unite" />
			<input placeholder="Prix unit. €" type="number" step="0.01" class="li-prix" required />
			<button type="button" class="btn btn-danger-ghost btn-small li-remove">✕</button>
		</div>`;
}

function renderInvoicePanel() {
	return `
		<div class="card">
			<h2 id="invoice-form-title">Nouveau devis / facture</h2>
			<p class="subtitle">Le régime de TVA détermine les mentions légales imprimées sur le document.</p>
			<form class="form-grid" id="form-invoice">
				<div class="form-field">
					<label for="inv_numero">Numéro *</label>
					<input id="inv_numero" name="numero" required placeholder="DEV-2026-002" />
				</div>
				<div class="form-field">
					<label for="inv_estimate">Type</label>
					<select id="inv_estimate" name="estCeUnDevis">
						<option value="true">Devis</option>
						<option value="false">Facture</option>
					</select>
				</div>
				<div class="form-field">
					<label for="inv_date">Date d'émission *</label>
					<input id="inv_date" name="dateEmission" type="date" required />
				</div>
				<div class="form-field">
					<label for="inv_echeance">Échéance</label>
					<input id="inv_echeance" name="dateEcheance" type="date" />
				</div>
				<div class="form-field">
					<label for="inv_client">Client</label>
					<select id="inv_client" name="client"></select>
				</div>
				<div class="form-field">
					<label for="inv_chantier">Chantier</label>
					<select id="inv_chantier" name="chantier"></select>
				</div>
				<div class="form-field">
					<label for="inv_regime">Régime de TVA</label>
					<select id="inv_regime" name="regimeTva">
						${options(LABELS.invoiceVatRegime).map((o) => `<option value="${o.value}">${o.label}</option>`).join('')}
					</select>
				</div>
				<div class="form-field">
					<label for="inv_tva">Taux TVA (%)</label>
					<input id="inv_tva" name="tauxTva" type="number" step="0.01" value="21" />
				</div>
				<div class="form-field">
					<label for="inv_attestation" style="flex-direction:row;align-items:center;gap:8px;">
						<input id="inv_attestation" name="attestationTva6" type="checkbox" style="width:16px;height:16px;" />
						Attestation TVA 6% reçue (logement &gt;10 ans)
					</label>
				</div>
				<div class="form-field">
					<label for="inv_remise">Remise (€)</label>
					<input id="inv_remise" name="remise" type="number" step="0.01" value="0" />
				</div>
				<div class="form-field span-2">
					<label>Lignes</label>
					<div class="items-editor" id="items-editor"></div>
					<button type="button" class="btn btn-ghost btn-small" id="add-line">+ Ajouter une ligne</button>
				</div>
				<div class="form-field span-2">
					<div class="totals-box" id="live-totals"></div>
					<p class="muted" id="tva-mention" style="margin-top:6px;font-size:12.5px;"></p>
				</div>
				<div class="form-field span-2 form-actions">
					<button type="button" class="btn btn-ghost" id="invoice-cancel-edit" style="display:none;">Annuler</button>
					<button type="submit" class="btn btn-primary" id="invoice-submit">Créer</button>
				</div>
			</form>
		</div>
		<div class="card">
			<h2>Liste</h2>
			<div class="table-holder"></div>
		</div>`;
}

function invoiceFormState() {
	const editor = document.getElementById('items-editor');
	return Array.from(editor.querySelectorAll('.item-row')).map((row) => ({
		description: row.querySelector('.li-desc').value,
		quantite: Number(row.querySelector('.li-qte').value || 0),
		unite: row.querySelector('.li-unite').value,
		prixUnitaire: Number(row.querySelector('.li-prix').value || 0)
	}));
}

function updateLiveTotals() {
	const remise = document.getElementById('inv_remise').value;
	const tva = document.getElementById('inv_tva').value;
	const regime = document.getElementById('inv_regime').value;
	const attestation = document.getElementById('inv_attestation').checked;
	const t = calcTotals(invoiceFormState(), remise, tva, []);
	document.getElementById('live-totals').innerHTML = `
		<span>Sous-total</span><span>${fmtMoney(t.sousTotal)}</span>
		<span>Après remise</span><span>${fmtMoney(t.apresRemise)}</span>
		<span>TVA</span><span>${fmtMoney(t.montantTva)}</span>
		<span class="total-line">Total</span><span class="total-line">${fmtMoney(t.total)}</span>`;
	document.getElementById('tva-mention').textContent = mentionTvaPreview(regime, attestation);
}

function fillSelect(selectEl, list, labelFn) {
	selectEl.innerHTML = `<option value="">—</option>` + list.map((item) => `<option value="${item.id}">${labelFn(item)}</option>`).join('');
}

async function initInvoiceSection() {
	const panel = document.getElementById('panel-invoices');
	panel.innerHTML = renderInvoicePanel();

	fillSelect(document.getElementById('inv_client'), cache.clients, (c) => c.nom);
	fillSelect(document.getElementById('inv_chantier'), cache.projects, (p) => p.nom);

	document.getElementById('inv_regime').addEventListener('change', (e) => {
		const presets = { normal: 21, reduit_6: 6, cocontractant: 0 };
		document.getElementById('inv_tva').value = presets[e.target.value];
		updateLiveTotals();
	});
	document.getElementById('inv_attestation').addEventListener('change', updateLiveTotals);

	const editor = document.getElementById('items-editor');
	let lineIndex = 0;
	function addLine(prefill) {
		editor.insertAdjacentHTML('beforeend', invoiceItemRowHtml(lineIndex++));
		const row = editor.lastElementChild;
		if (prefill) {
			row.querySelector('.li-desc').value = prefill.description || '';
			row.querySelector('.li-qte').value = prefill.quantite ?? 1;
			row.querySelector('.li-unite').value = prefill.unite || '';
			row.querySelector('.li-prix').value = prefill.prixUnitaire ?? '';
		}
		row.querySelectorAll('input').forEach((input) => input.addEventListener('input', updateLiveTotals));
		row.querySelector('.li-remove').addEventListener('click', () => {
			row.remove();
			updateLiveTotals();
		});
		updateLiveTotals();
	}
	document.getElementById('add-line').addEventListener('click', () => addLine());
	addLine();

	document.getElementById('inv_remise').addEventListener('input', updateLiveTotals);
	document.getElementById('inv_tva').addEventListener('input', updateLiveTotals);

	const form = document.getElementById('form-invoice');

	function resetInvoiceForm() {
		delete form.dataset.editingId;
		form.reset();
		editor.innerHTML = '';
		lineIndex = 0;
		addLine();
		document.getElementById('invoice-submit').textContent = 'Créer';
		document.getElementById('invoice-cancel-edit').style.display = 'none';
		document.getElementById('invoice-form-title').textContent = 'Nouveau devis / facture';
	}
	document.getElementById('invoice-cancel-edit').addEventListener('click', resetInvoiceForm);

	panel._enterInvoiceEditMode = (inv) => {
		form.dataset.editingId = inv.id;
		form.querySelector('[name="numero"]').value = inv.numero;
		form.querySelector('[name="estCeUnDevis"]').value = String(inv.estCeUnDevis);
		form.querySelector('[name="dateEmission"]').value = inv.dateEmission || '';
		form.querySelector('[name="dateEcheance"]').value = inv.dateEcheance || '';
		form.querySelector('[name="client"]').value = (inv.client && inv.client.id) || '';
		form.querySelector('[name="chantier"]').value = (inv.chantier && inv.chantier.id) || '';
		form.querySelector('[name="regimeTva"]').value = inv.regimeTva || 'normal';
		form.querySelector('[name="tauxTva"]').value = inv.tauxTva;
		form.querySelector('[name="attestationTva6"]').checked = !!inv.attestationTva6;
		form.querySelector('[name="remise"]').value = inv.remise || 0;

		editor.innerHTML = '';
		lineIndex = 0;
		(inv.lignes && inv.lignes.length ? inv.lignes : [{}]).forEach((l) => addLine(l));

		document.getElementById('invoice-submit').textContent = 'Enregistrer les modifications';
		document.getElementById('invoice-cancel-edit').style.display = '';
		document.getElementById('invoice-form-title').textContent = `Modifier : ${inv.numero}`;
		form.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const fd = new FormData(form);
		const lignes = invoiceFormState();
		if (!lignes.length) {
			showToast('Ajoute au moins une ligne.', true);
			return;
		}
		const editingId = form.dataset.editingId;
		const payload = {
			numero: fd.get('numero'),
			estCeUnDevis: fd.get('estCeUnDevis') === 'true',
			dateEmission: fd.get('dateEmission'),
			dateEcheance: fd.get('dateEcheance') || undefined,
			regimeTva: fd.get('regimeTva'),
			attestationTva6: fd.get('attestationTva6') === 'on',
			tauxTva: Number(fd.get('tauxTva') || 0),
			remise: Number(fd.get('remise') || 0),
			lignes
		};
		const clientId = fd.get('client');
		const chantierId = fd.get('chantier');
		if (clientId) payload.client = { id: clientId };
		if (chantierId) payload.chantier = { id: chantierId };

		try {
			await fetchJSON(`${API}/invoices${editingId ? '/' + editingId : ''}`, {
				method: editingId ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			showToast(editingId ? 'Devis/facture modifié.' : 'Devis/facture créé.');
			resetInvoiceForm();
			await refreshCache();
			await renderInvoiceList();
		} catch (err) {
			showToast(err.message, true);
		}
	});

	await renderInvoiceList();
}

async function renderInvoiceList() {
	const panel = document.getElementById('panel-invoices');
	const rows = await fetchJSON(`${API}/invoices`);
	const holder = panel.querySelector('.table-holder');
	if (!rows.length) {
		holder.innerHTML = `<p class="muted">Aucun devis/facture pour le moment.</p>`;
		return;
	}
	holder.innerHTML = `
		<table>
			<thead>
				<tr>
					<th>Numéro</th><th>Type</th><th>Client</th><th>Régime TVA</th><th>Statut</th><th>Total</th><th>Solde dû</th><th></th>
				</tr>
			</thead>
			<tbody>
				${rows
					.map((inv) => {
						const t = calcTotals(inv.lignes, inv.remise, inv.tauxTva, inv.paiements);
						return `
					<tr data-id="${inv.id}">
						<td data-label="Numéro">${inv.numero}</td>
						<td data-label="Type">${inv.estCeUnDevis ? 'Devis' : 'Facture'}</td>
						<td data-label="Client">${inv.client ? inv.client.nom : '—'}</td>
						<td data-label="Régime TVA">${badge(inv.regimeTva, LABELS.invoiceVatRegime)}</td>
						<td data-label="Statut">
							<select class="statut-quick-select" data-id="${inv.id}" style="padding:4px 7px;font-size:12px;">
								${options(LABELS.invoiceStatus)
									.map((o) => `<option value="${o.value}" ${o.value === inv.statut ? 'selected' : ''}>${o.label}</option>`)
									.join('')}
							</select>
						</td>
						<td data-label="Total">${fmtMoney(t.total)}</td>
						<td data-label="Solde dû">${fmtMoney(t.soldeDu)}</td>
						<td>
							<button class="btn btn-ghost btn-small btn-edit-invoice" data-id="${inv.id}">Modifier</button>
							<a class="btn btn-ghost btn-small" href="${API}/invoices/${inv.id}/print" target="_blank" rel="noopener">Imprimer</a>
							<button class="btn btn-danger-ghost btn-small btn-delete-invoice" data-id="${inv.id}">Supprimer</button>
						</td>
					</tr>`;
					})
					.join('')}
			</tbody>
		</table>`;
	holder.querySelectorAll('.statut-quick-select').forEach((sel) => {
		sel.addEventListener('change', async () => {
			try {
				await fetchJSON(`${API}/invoices/${sel.dataset.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ statut: sel.value })
				});
				showToast('Statut mis à jour.');
				await renderInvoiceList();
			} catch (err) {
				showToast(err.message, true);
			}
		});
	});
	holder.querySelectorAll('.btn-edit-invoice').forEach((btn) => {
		btn.addEventListener('click', () => {
			const inv = rows.find((r) => r.id === btn.dataset.id);
			if (inv && panel._enterInvoiceEditMode) panel._enterInvoiceEditMode(inv);
		});
	});
	holder.querySelectorAll('.btn-delete-invoice').forEach((btn) => {
		btn.addEventListener('click', async () => {
			if (!confirm('Supprimer ce devis/facture ?')) return;
			try {
				await fetchJSON(`${API}/invoices/${btn.dataset.id}`, { method: 'DELETE' });
				showToast('Supprimé.');
				await refreshCache();
				await renderInvoiceList();
			} catch (err) {
				showToast(err.message, true);
			}
		});
	});
}

/* ------------------------------------------------------------------ */
/* Paramètres entreprise — formulaire singleton                       */
/* ------------------------------------------------------------------ */

function renderSettingsPanel() {
	return `
		<div class="card">
			<h2>Informations de l'entreprise</h2>
			<p class="subtitle">Utilisées sur les devis/factures imprimés (mentions légales belges).</p>
			<form class="form-grid" id="form-settings">
				<div class="form-field span-2">
					<label for="s_nom">Nom de l'entreprise</label>
					<input id="s_nom" name="nomEntreprise" />
				</div>
				<div class="form-field">
					<label for="s_tva">N° TVA/BCE</label>
					<input id="s_tva" name="numeroTva" placeholder="BE0123456789" />
				</div>
				<div class="form-field">
					<label for="s_iban">IBAN</label>
					<input id="s_iban" name="iban" placeholder="BE00 0000 0000 0000" />
				</div>
				<div class="form-field span-2">
					<label for="s_adresse">Adresse</label>
					<input id="s_adresse" name="adresse" />
				</div>
				<div class="form-field">
					<label for="s_tel">Téléphone</label>
					<input id="s_tel" name="telephone" />
				</div>
				<div class="form-field">
					<label for="s_email">Email</label>
					<input id="s_email" name="email" type="email" />
				</div>
				<div class="form-field span-2">
					<label for="s_cond">Conditions de paiement (imprimées sur chaque document)</label>
					<textarea id="s_cond" name="conditionsPaiement" placeholder="Ex: Paiement à 30 jours. Acompte de 30% à la commande."></textarea>
				</div>
				<div class="form-field span-2 form-actions">
					<button type="submit" class="btn btn-primary">Enregistrer</button>
				</div>
			</form>
		</div>`;
}

async function initSettingsSection() {
	const panel = document.getElementById('panel-settings');
	panel.innerHTML = renderSettingsPanel();
	const form = panel.querySelector('#form-settings');

	const current = await fetchJSON(`${API}/settings`);
	Object.entries(current).forEach(([key, value]) => {
		const input = form.querySelector(`[name="${key}"]`);
		if (input && value != null) input.value = value;
	});

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const fd = new FormData(form);
		const payload = Object.fromEntries(fd.entries());
		try {
			await fetchJSON(`${API}/settings`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			showToast('Enregistré.');
		} catch (err) {
			showToast(err.message, true);
		}
	});
}

/* ------------------------------------------------------------------ */
/* Tableau de bord                                                     */
/* ------------------------------------------------------------------ */

function todayStr() {
	return new Date().toISOString().slice(0, 10);
}

const MOIS_COURT_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function statCardShell(content, tone) {
	return `<div class="stat-card ${tone ? 'tone-' + tone : ''}">${content}</div>`;
}

/* Dégradé d'aire façon sparkline (ex: tendance du CA facturé sur 6 mois). */
function buildAreaSparkline(values, { width = 160, height = 44, color = '#3366ff', id = 'a' } = {}) {
	if (!values.length) return '';
	const max = Math.max(...values, 0.0001);
	const min = Math.min(...values, 0);
	const range = max - min || 1;
	const stepX = width / (values.length - 1 || 1);
	const points = values.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 4) - 2]);
	const line = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
	const area = `${line} L${width},${height} L0,${height} Z`;
	const gradId = `spark-grad-${id}`;
	return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
		<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
			<stop offset="100%" stop-color="${color}" stop-opacity="0"/>
		</linearGradient></defs>
		<path d="${area}" fill="url(#${gradId})" stroke="none"/>
		<path d="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
	</svg>`;
}

/* Mini barres (ex: nombre de nouveaux chantiers par mois). */
function buildMiniBars(values, { width = 160, height = 44, color = '#3366ff' } = {}) {
	if (!values.length) return '';
	const max = Math.max(...values, 1);
	const n = values.length;
	const gap = 4;
	const barW = (width - gap * (n - 1)) / n;
	const bars = values
		.map((v, i) => {
			const h = Math.max((v / max) * (height - 4), 2);
			const x = i * (barW + gap);
			const y = height - h;
			return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="${color}"/>`;
		})
		.join('');
	return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">${bars}</svg>`;
}

/* Graphique en barres groupées (ex: CA facturé vs encaissé par mois). */
function buildGroupedBarChart(categories, series, { width = 640, height = 230 } = {}) {
	const padLeft = 36;
	const padBottom = 22;
	const padTop = 10;
	const plotW = width - padLeft - 10;
	const plotH = height - padBottom - padTop;
	const allValues = series.flatMap((s) => s.data);
	const maxVal = Math.max(...allValues, 1);
	const scaleMax = maxVal * 1.2;
	const n = categories.length || 1;
	const groupW = plotW / n;
	const barGap = 3;
	const barW = Math.max((groupW - barGap * (series.length + 1)) / Math.max(series.length, 1), 3);

	let bars = '';
	categories.forEach((_cat, ci) => {
		series.forEach((s, si) => {
			const v = s.data[ci] || 0;
			const h = (v / scaleMax) * plotH;
			const x = padLeft + ci * groupW + barGap + si * (barW + barGap);
			const y = padTop + (plotH - h);
			bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${s.color}"/>`;
		});
	});

	let gridlines = '';
	const steps = 4;
	for (let i = 0; i <= steps; i++) {
		const y = padTop + plotH - (plotH / steps) * i;
		const val = Math.round((scaleMax / steps) * i);
		gridlines += `<line x1="${padLeft}" y1="${y.toFixed(1)}" x2="${width - 10}" y2="${y.toFixed(1)}" stroke="#edf1f7" stroke-width="1"/>`;
		gridlines += `<text x="${padLeft - 8}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="10" fill="#8f9bb3">${val}</text>`;
	}

	let xLabels = '';
	categories.forEach((cat, ci) => {
		const x = padLeft + ci * groupW + groupW / 2;
		xLabels += `<text x="${x.toFixed(1)}" y="${height - 5}" text-anchor="middle" font-size="10" fill="#8f9bb3">${cat}</text>`;
	});

	return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:${height}px;">${gridlines}${bars}${xLabels}</svg>`;
}

function trendHtml(curr, prev) {
	if (!prev) return '';
	const pct = ((curr - prev) / prev) * 100;
	const up = pct >= 0;
	const arrow = up
		? '<svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1l4 5H1z" fill="currentColor"/></svg>'
		: '<svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 9L1 4h8z" fill="currentColor"/></svg>';
	return `<div class="stat-trend ${up ? 'up' : 'down'}">${arrow} ${Math.abs(pct).toFixed(0)}% vs mois dernier</div>`;
}

async function initDashboardSection() {
	const panel = document.getElementById('panel-dashboard');
	const [projects, invoices, expenses, tasks, payments] = await Promise.all([
		fetchJSON(`${API}/projects`),
		fetchJSON(`${API}/invoices`),
		fetchJSON(`${API}/expenses`),
		fetchJSON(`${API}/tasks`),
		fetchJSON(`${API}/payments`)
	]);

	const today = todayStr();
	const now = new Date();
	const year = now.getFullYear();
	const curMonth = now.getMonth();

	const facturesReelles = invoices.filter((i) => !i.estCeUnDevis && i.statut !== 'annule');
	const devisEnAttente = invoices.filter((i) => i.estCeUnDevis && ['envoye', 'brouillon'].includes(i.statut)).length;
	const chantiersActifs = projects.filter((p) => ['planifie', 'en_cours'].includes(p.statut)).length;

	// Séries mensuelles pour l'année en cours.
	const facturePerMonth = Array(12).fill(0);
	facturesReelles.forEach((inv) => {
		if (!inv.dateEmission || !inv.dateEmission.startsWith(String(year))) return;
		const m = Number(inv.dateEmission.slice(5, 7)) - 1;
		const t = calcTotals(inv.lignes, inv.remise, inv.tauxTva, inv.paiements);
		facturePerMonth[m] += t.total;
	});
	const payePerMonth = Array(12).fill(0);
	payments.forEach((p) => {
		if (!p.date || !p.date.startsWith(String(year))) return;
		const m = Number(p.date.slice(5, 7)) - 1;
		payePerMonth[m] += Number(p.montant || 0);
	});
	const chantiersPerMonth = Array(12).fill(0);
	projects.forEach((p) => {
		if (!p.dateDebut || !p.dateDebut.startsWith(String(year))) return;
		const m = Number(p.dateDebut.slice(5, 7)) - 1;
		chantiersPerMonth[m] += 1;
	});

	let soldeDuTotal = 0;
	let facturesEnRetard = 0;
	facturesReelles.forEach((inv) => {
		const t = calcTotals(inv.lignes, inv.remise, inv.tauxTva, inv.paiements);
		if (t.soldeDu > 0.01) {
			soldeDuTotal += t.soldeDu;
			if (inv.dateEcheance && inv.dateEcheance < today) facturesEnRetard++;
		}
	});

	const caFacture = facturePerMonth.reduce((a, b) => a + b, 0);
	const depensesTotales = expenses.reduce((sum, e) => sum + Number(e.montant || 0), 0);
	const margeEstimee = caFacture ? ((caFacture - depensesTotales) / caFacture) * 100 : 0;
	const tachesEnRetard = tasks.filter((t) => t.statut !== 'terminee' && t.dateEcheance && t.dateEcheance < today).length;

	const sparkCa = facturePerMonth.slice(Math.max(curMonth - 5, 0), curMonth + 1);
	const sparkChantiers = chantiersPerMonth.slice(Math.max(curMonth - 5, 0), curMonth + 1);

	// Classement des chantiers par CA facturé.
	const parChantier = new Map();
	facturesReelles.forEach((inv) => {
		if (!inv.chantier) return;
		const t = calcTotals(inv.lignes, inv.remise, inv.tauxTva, inv.paiements);
		parChantier.set(inv.chantier.id, {
			nom: inv.chantier.nom,
			total: (parChantier.get(inv.chantier.id)?.total || 0) + t.total
		});
	});
	const classement = Array.from(parChantier.values())
		.sort((a, b) => b.total - a.total)
		.slice(0, 7);

	const prochaines = []
		.concat(
			projects
				.filter((p) => p.dateFinPrevue && p.dateFinPrevue >= today)
				.map((p) => ({ date: p.dateFinPrevue, label: `Fin prévue — ${p.nom}` })),
			tasks
				.filter((t) => t.statut !== 'terminee' && t.dateEcheance && t.dateEcheance >= today)
				.map((t) => ({ date: t.dateEcheance, label: `${t.titre}${t.chantier ? ' — ' + t.chantier.nom : ''}` }))
		)
		.sort((a, b) => a.date.localeCompare(b.date))
		.slice(0, 6);

	panel.innerHTML = `
		<div class="stat-grid">
			${statCardShell(`
				<div class="stat-card-head"><span>CA facturé (${year})</span><span class="stat-icon-info">i</span></div>
				<div class="stat-value">${fmtMoney(caFacture)}</div>
				${trendHtml(facturePerMonth[curMonth], facturePerMonth[curMonth - 1] || facturePerMonth[11])}
				<div class="stat-chart">${buildAreaSparkline(sparkCa, { color: '#00d68f', id: 'ca' })}</div>
			`)}
			${statCardShell(`
				<div class="stat-card-head"><span>Chantiers actifs</span><span class="stat-icon-info">i</span></div>
				<div class="stat-value">${chantiersActifs}</div>
				<div class="stat-label">${projects.length} au total</div>
				<div class="stat-chart">${buildMiniBars(sparkChantiers, { color: '#3366ff' })}</div>
			`)}
			${statCardShell(
				`
				<div class="stat-card-head"><span>Solde dû total</span><span class="stat-icon-info">i</span></div>
				<div class="stat-value">${fmtMoney(soldeDuTotal)}</div>
				<div class="stat-label">${facturesEnRetard} facture(s) en retard</div>
			`,
				facturesEnRetard > 0 ? 'danger' : soldeDuTotal > 0 ? 'warning' : 'success'
			)}
			${statCardShell(`
				<div class="stat-card-head"><span>Marge estimée</span><span class="stat-icon-info">i</span></div>
				<div class="stat-value">${margeEstimee.toFixed(0)}%</div>
				<div class="stat-label">Dépenses : ${fmtMoney(depensesTotales)} · ${devisEnAttente} devis en attente</div>
			`, margeEstimee >= 0 ? 'success' : 'danger')}
		</div>

		<div class="dashboard-main-row">
			<div class="card">
				<div class="chart-card-head">
					<h2>CA facturé vs encaissé — ${year}</h2>
					<div class="chart-legend">
						<span><span class="legend-dot" style="background:#3366ff"></span>Facturé</span>
						<span><span class="legend-dot" style="background:#00d68f"></span>Encaissé</span>
					</div>
				</div>
				${buildGroupedBarChart(MOIS_COURT_FR, [
					{ label: 'Facturé', color: '#3366ff', data: facturePerMonth },
					{ label: 'Encaissé', color: '#00d68f', data: payePerMonth }
				])}
			</div>
			<div class="card">
				<h2>Classement chantiers</h2>
				<p class="subtitle">Par chiffre d'affaires facturé.</p>
				<ul class="ranking-list">
					${
						classement.length
							? classement
									.map(
										(c, i) => `
							<li>
								<span class="rank-badge ${i === 0 ? 'top' : ''}">${i + 1}</span>
								<span class="rank-name">${c.nom}</span>
								<span class="rank-value">${fmtMoney(c.total)}</span>
							</li>`
									)
									.join('')
							: '<li class="muted">Pas encore de données.</li>'
					}
				</ul>
			</div>
		</div>

		<div class="dashboard-columns" style="margin-top:20px;">
			<div class="card">
				<h2>Prochaines échéances</h2>
				<p class="subtitle">Fins de chantier et tâches à venir.</p>
				<ul class="list-simple">
					${
						prochaines.length
							? prochaines.map((p) => `<li><span>${p.label}</span><span class="li-meta">${fmtDate(p.date)}</span></li>`).join('')
							: '<li class="muted">Rien à venir.</li>'
					}
				</ul>
			</div>
			<div class="card">
				<h2>Alertes</h2>
				<ul class="list-simple">
					<li><span>Factures en retard</span><span class="li-meta">${facturesEnRetard}</span></li>
					<li><span>Tâches en retard</span><span class="li-meta">${tachesEnRetard}</span></li>
					<li><span>Devis en attente de réponse</span><span class="li-meta">${devisEnAttente}</span></li>
				</ul>
			</div>
		</div>`;
}

/* ------------------------------------------------------------------ */
/* Calendrier                                                          */
/* ------------------------------------------------------------------ */

const MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const JOURS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const calendarState = { year: new Date().getFullYear(), month: new Date().getMonth(), selected: todayStr() };

function fmtDateKey(year, month, day) {
	return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function renderCalendarPanel() {
	return `
		<div class="card">
			<div class="calendar-nav">
				<button class="btn btn-ghost btn-small" id="cal-prev">‹ Précédent</button>
				<span class="month-label" id="cal-month-label"></span>
				<button class="btn btn-ghost btn-small" id="cal-next">Suivant ›</button>
			</div>
			<div class="calendar-legend">
				<span><span class="legend-dot dot-chantier-debut"></span>Début de chantier</span>
				<span><span class="legend-dot dot-chantier-fin"></span>Fin prévue de chantier</span>
				<span><span class="legend-dot dot-tache"></span>Échéance de tâche</span>
				<span><span class="legend-dot dot-facture"></span>Échéance de facture (solde dû)</span>
			</div>
			<div class="calendar-grid" id="cal-grid"></div>
			<div class="day-detail" id="cal-day-detail"></div>
		</div>`;
}

async function buildCalendarEvents() {
	const [projects, tasks, invoices] = await Promise.all([
		fetchJSON(`${API}/projects`),
		fetchJSON(`${API}/tasks`),
		fetchJSON(`${API}/invoices`)
	]);
	const events = {};
	const push = (date, label, tone) => {
		if (!date) return;
		(events[date] ||= []).push({ label, tone });
	};
	projects.forEach((p) => {
		push(p.dateDebut, `Début — ${p.nom}`, 'chantier-debut');
		push(p.dateFinPrevue, `Fin prévue — ${p.nom}`, 'chantier-fin');
	});
	tasks.forEach((t) => {
		if (t.statut !== 'terminee') push(t.dateEcheance, `Tâche — ${t.titre}`, 'tache');
	});
	invoices
		.filter((i) => !i.estCeUnDevis)
		.forEach((inv) => {
			const t = calcTotals(inv.lignes, inv.remise, inv.tauxTva, inv.paiements);
			if (t.soldeDu > 0.01) push(inv.dateEcheance, `Échéance facture ${inv.numero}`, 'facture');
		});
	return events;
}

function renderDayDetail(dateKey, events) {
	const holder = document.getElementById('cal-day-detail');
	const list = events[dateKey] || [];
	const [y, m, d] = dateKey.split('-');
	holder.innerHTML = `
		<h3>${d}/${m}/${y}</h3>
		${
			list.length
				? `<ul class="list-simple">${list
						.map(
							(e) =>
								`<li><span><span class="day-dot dot-${e.tone}" style="margin-right:7px;display:inline-block;vertical-align:middle;"></span>${e.label}</span></li>`
						)
						.join('')}</ul>`
				: '<p class="muted">Rien ce jour-là.</p>'
		}`;
}

async function renderCalendarMonth() {
	const events = await buildCalendarEvents();
	const { year, month } = calendarState;
	document.getElementById('cal-month-label').textContent = `${MOIS_FR[month]} ${year}`;

	const firstDay = new Date(year, month, 1);
	const startOffset = (firstDay.getDay() + 6) % 7; // lundi = colonne 0
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const today = todayStr();

	const cells = [];
	for (let i = 0; i < startOffset; i++) cells.push(null);
	for (let d = 1; d <= daysInMonth; d++) cells.push(d);
	while (cells.length % 7 !== 0) cells.push(null);

	const grid = document.getElementById('cal-grid');
	grid.innerHTML =
		JOURS_FR.map((j) => `<div class="calendar-weekday">${j}</div>`).join('') +
		cells
			.map((day) => {
				if (!day) return `<div class="calendar-day empty"></div>`;
				const key = fmtDateKey(year, month, day);
				const dayEvents = events[key] || [];
				const classes = ['calendar-day'];
				if (key === today) classes.push('today');
				if (key === calendarState.selected) classes.push('selected');
				return `
					<div class="${classes.join(' ')}" data-date="${key}">
						<div class="day-number">${day}</div>
						<div class="day-dots">${dayEvents
							.slice(0, 4)
							.map((e) => `<span class="day-dot dot-${e.tone}"></span>`)
							.join('')}</div>
					</div>`;
			})
			.join('');

	grid.querySelectorAll('.calendar-day[data-date]').forEach((cell) => {
		cell.addEventListener('click', () => {
			calendarState.selected = cell.dataset.date;
			grid.querySelectorAll('.calendar-day').forEach((c) => c.classList.remove('selected'));
			cell.classList.add('selected');
			renderDayDetail(cell.dataset.date, events);
		});
	});

	renderDayDetail(calendarState.selected, events);
}

async function initCalendarSection() {
	const panel = document.getElementById('panel-calendar');
	panel.innerHTML = renderCalendarPanel();
	document.getElementById('cal-prev').addEventListener('click', () => {
		calendarState.month--;
		if (calendarState.month < 0) {
			calendarState.month = 11;
			calendarState.year--;
		}
		renderCalendarMonth();
	});
	document.getElementById('cal-next').addEventListener('click', () => {
		calendarState.month++;
		if (calendarState.month > 11) {
			calendarState.month = 0;
			calendarState.year++;
		}
		renderCalendarMonth();
	});
	await renderCalendarMonth();
}

/* ------------------------------------------------------------------ */
/* Tabs / bootstrap                                                     */
/* ------------------------------------------------------------------ */

const ALL_TABS = [
	{ key: 'dashboard', label: 'Tableau de bord' },
	{ key: 'calendar', label: 'Calendrier' },
	{ key: 'projects', label: 'Chantiers' },
	{ key: 'tasks', label: 'Tâches' },
	{ key: 'invoices', label: 'Devis & Factures' },
	{ key: 'payments', label: 'Paiements' },
	{ key: 'clients', label: 'Clients' },
	{ key: 'employees', label: 'Employés' },
	{ key: 'teams', label: 'Équipes' },
	{ key: 'expenses', label: 'Dépenses' },
	{ key: 'equipment', label: 'Matériel' },
	{ key: 'vendors', label: 'Fournisseurs' },
	{ key: 'settings', label: 'Paramètres' }
];

function setActiveTab(key) {
	document.querySelectorAll('nav.sidebar-nav button').forEach((b) => b.classList.toggle('active', b.dataset.key === key));
	document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === `panel-${key}`));
	const tab = ALL_TABS.find((t) => t.key === key);
	document.getElementById('page-title').textContent = tab ? tab.label : '';
}

async function main() {
	const tabsNav = document.getElementById('tabs');
	const panelsRoot = document.getElementById('panels');

	tabsNav.innerHTML = ALL_TABS.map(
		(t) => `<button data-key="${t.key}">${svgIcon(t.key)}${t.label}</button>`
	).join('');
	panelsRoot.innerHTML = ALL_TABS.map((t) => `<section class="panel" id="panel-${t.key}"></section>`).join('');

	tabsNav.querySelectorAll('button').forEach((btn) => {
		btn.addEventListener('click', () => setActiveTab(btn.dataset.key));
	});

	await refreshCache();

	for (const section of SECTIONS) {
		await initGenericSection(section);
	}
	await initInvoiceSection();
	await initSettingsSection();
	await initDashboardSection();
	await initCalendarSection();

	setActiveTab('dashboard');
}

main().catch((err) => showToast(err.message, true));
