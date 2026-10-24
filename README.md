# reno-gestion

Outil de gestion local pour une entreprise de rénovation générale : clients, chantiers, devis/factures, employés, équipes, dépenses et matériel.

**Pas de système de connexion.** Prévu pour un usage local uniquement (une seule personne ou une équipe sur le même réseau local, sans authentification).

Ce projet reprend le modèle de données et la logique métier de modules équivalents du logiciel open-source [ever-gauzy](https://github.com/ever-co/ever-gauzy), simplifiés et adaptés pour une entreprise de rénovation, sans la complexité multi-tenant / permissions / plugins de l'original.

## Démarrage

```bash
npm install
npm run seed   # insère des données de démonstration (facultatif, à lancer une seule fois)
npm run dev    # démarre l'API sur http://localhost:3100
```

Les données sont stockées dans un simple fichier `reno-gestion.sqlite` à la racine du projet (créé automatiquement au premier lancement). Pas de serveur de base de données à installer.

## Modules disponibles (API REST)

Chaque ressource a les mêmes opérations : `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.

| Ressource | Chemin | Description |
|---|---|---|
| Clients | `/api/clients` | Fiches clients (particuliers ou professionnels) |
| Chantiers | `/api/projects` | Chantiers/projets, statut, dates, budget |
| Tâches | `/api/tasks` | Tâches d'un chantier, assignées à un employé |
| Employés | `/api/employees` | Employés, métier, taux horaire |
| Équipes | `/api/teams` | Équipes de chantier (groupes d'employés) |
| Devis/Factures | `/api/invoices` | `estCeUnDevis: true` pour un devis, `false` pour une facture |
| Lignes de devis/facture | (imbriquées dans `invoices.lignes`) | Description, quantité, prix unitaire |
| Dépenses | `/api/expenses` | Dépenses liées à un chantier (matériaux, sous-traitance...) |
| Matériel | `/api/equipment` | Outils/machines de l'entreprise, statut, affectation |
| Fournisseurs | `/api/vendors` | Fournisseurs de matériaux / sous-traitants |

### Endpoint spécial

`GET /api/invoices/:id/totaux` — calcule sous-total, remise, TVA et total d'un devis/facture à partir de ses lignes.

## Exemple : créer un devis

```bash
curl -X POST http://localhost:3100/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "DEV-2026-002",
    "estCeUnDevis": true,
    "dateEmission": "2026-02-01",
    "tauxTva": 21,
    "client": { "id": "<id-du-client>" },
    "chantier": { "id": "<id-du-chantier>" },
    "lignes": [
      { "description": "Peinture salon", "quantite": 40, "unite": "m2", "prixUnitaire": 18 }
    ]
  }'
```

## Statuts disponibles

- **Chantier** (`statut`) : `devis`, `planifie`, `en_cours`, `en_pause`, `termine`, `annule`
- **Tâche** (`statut`) : `a_faire`, `en_cours`, `terminee`, `bloquee`
- **Devis/Facture** (`statut`) : `brouillon`, `envoye`, `accepte`, `refuse`, `paye`, `en_retard`, `annule`
- **Matériel** (`statut`) : `disponible`, `en_utilisation`, `en_maintenance`, `hors_service`

## Pas encore inclus

Ce projet fournit uniquement l'API (backend + base de données). Il n'y a pas d'interface web pour l'instant — les requêtes se font via `curl`, Postman, ou un futur frontend simple. Si besoin, demander l'ajout d'une interface web basique.
