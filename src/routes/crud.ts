import { Router } from 'express';
import { EntityTarget, FindOptionsRelations, ObjectLiteral, Repository } from 'typeorm';
import { AppDataSource } from '../data-source';

/**
 * Fabrique un routeur REST CRUD basique (GET liste, GET un, POST, PUT, DELETE) pour une entité.
 * Pas d'authentification : usage local uniquement.
 */
export function crudRouter<T extends ObjectLiteral>(
	entity: EntityTarget<T>,
	relations: FindOptionsRelations<T> = {}
): Router {
	const router = Router();
	const getRepo = (): Repository<T> => AppDataSource.getRepository(entity);

	router.get('/', async (_req, res) => {
		const items = await getRepo().find({ relations });
		res.json(items);
	});

	router.get('/:id', async (req, res) => {
		const item = await getRepo().findOne({ where: { id: req.params.id } as any, relations });
		if (!item) return res.status(404).json({ error: 'Introuvable' });
		res.json(item);
	});

	router.post('/', async (req, res) => {
		const created = getRepo().create(req.body);
		const saved = await getRepo().save(created as any);
		res.status(201).json(saved);
	});

	router.put('/:id', async (req, res) => {
		const repo = getRepo();
		// Charge aussi les relations : sans l'état actuel d'une collection en cascade (ex: les
		// lignes d'une facture), TypeORM ne peut pas calculer quelles lignes ont été retirées et
		// les orpheline au lieu de les supprimer.
		const existing = await repo.findOne({ where: { id: req.params.id } as any, relations });
		if (!existing) return res.status(404).json({ error: 'Introuvable' });
		repo.merge(existing, req.body);
		const saved = await repo.save(existing);
		res.json(saved);
	});

	router.delete('/:id', async (req, res) => {
		const result = await getRepo().delete(req.params.id);
		if (!result.affected) return res.status(404).json({ error: 'Introuvable' });
		res.status(204).send();
	});

	return router;
}
