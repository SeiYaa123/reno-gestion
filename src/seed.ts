import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { Client, ClientType } from './entities/Client';
import { Employee } from './entities/Employee';
import { Team } from './entities/Team';
import { Project, ProjectStatus } from './entities/Project';
import { Task, TaskStatus, TaskPriority } from './entities/Task';
import { Invoice, InvoiceStatus } from './entities/Invoice';
import { InvoiceItem } from './entities/InvoiceItem';
import { Vendor } from './entities/Vendor';
import { Equipment } from './entities/Equipment';

async function seed(): Promise<void> {
	await AppDataSource.initialize();

	const clientRepo = AppDataSource.getRepository(Client);
	const employeeRepo = AppDataSource.getRepository(Employee);
	const teamRepo = AppDataSource.getRepository(Team);
	const projectRepo = AppDataSource.getRepository(Project);
	const taskRepo = AppDataSource.getRepository(Task);
	const invoiceRepo = AppDataSource.getRepository(Invoice);
	const vendorRepo = AppDataSource.getRepository(Vendor);
	const equipmentRepo = AppDataSource.getRepository(Equipment);

	const client = await clientRepo.save(
		clientRepo.create({
			nom: 'Dupont Sophie',
			email: 'sophie.dupont@example.com',
			telephone: '0032 475 00 00 00',
			adresse: 'Rue de la Rénovation 12, 1000 Bruxelles',
			type: ClientType.PARTICULIER
		})
	);

	const macon = await employeeRepo.save(
		employeeRepo.create({ prenom: 'Karim', nom: 'Benali', metier: 'Maçon', tauxHoraire: 35 })
	);
	const electricien = await employeeRepo.save(
		employeeRepo.create({ prenom: 'Luc', nom: 'Verhoeven', metier: 'Électricien', tauxHoraire: 42 })
	);

	const equipe = await teamRepo.save(teamRepo.create({ nom: 'Équipe A', membres: [macon, electricien] }));

	const chantier = await projectRepo.save(
		projectRepo.create({
			nom: 'Rénovation cuisine - Dupont',
			adresseChantier: 'Rue de la Rénovation 12, 1000 Bruxelles',
			description: "Démolition cuisine existante, pose carrelage, mise aux normes électriques",
			statut: ProjectStatus.EN_COURS,
			dateDebut: '2026-01-15',
			dateFinPrevue: '2026-02-28',
			budget: 15000,
			client
		})
	);

	equipe.chantier = chantier;
	await teamRepo.save(equipe);

	await taskRepo.save([
		taskRepo.create({
			titre: 'Démolition ancienne cuisine',
			statut: TaskStatus.TERMINEE,
			priorite: TaskPriority.HAUTE,
			chantier,
			assigneA: macon
		}),
		taskRepo.create({
			titre: 'Mise aux normes tableau électrique',
			statut: TaskStatus.EN_COURS,
			priorite: TaskPriority.HAUTE,
			chantier,
			assigneA: electricien
		}),
		taskRepo.create({
			titre: 'Pose carrelage sol',
			statut: TaskStatus.A_FAIRE,
			priorite: TaskPriority.NORMALE,
			chantier,
			assigneA: macon
		})
	]);

	await vendorRepo.save(
		vendorRepo.create({ nom: 'Quincaillerie Martin', categorie: 'Matériaux', telephone: '0032 2 000 00 00' })
	);

	await equipmentRepo.save([
		equipmentRepo.create({ nom: 'Bétonnière', categorie: 'Gros œuvre' }),
		equipmentRepo.create({ nom: 'Échafaudage 4m', categorie: 'Accès en hauteur' })
	]);

	const devis = invoiceRepo.create({
		numero: 'DEV-2026-001',
		estCeUnDevis: true,
		dateEmission: '2026-01-10',
		statut: InvoiceStatus.ACCEPTE,
		tauxTva: 21,
		remise: 0,
		client,
		chantier,
		lignes: [
			Object.assign(new InvoiceItem(), { description: 'Démolition et évacuation', quantite: 1, unite: 'forfait', prixUnitaire: 800 }),
			Object.assign(new InvoiceItem(), { description: 'Carrelage sol 25m²', quantite: 25, unite: 'm2', prixUnitaire: 45 }),
			Object.assign(new InvoiceItem(), { description: 'Mise aux normes électriques', quantite: 1, unite: 'forfait', prixUnitaire: 1200 })
		]
	});
	await invoiceRepo.save(devis);

	console.log('Données de démonstration insérées avec succès.');
	await AppDataSource.destroy();
}

seed().catch((error) => {
	console.error('Échec du seed:', error);
	process.exit(1);
});
