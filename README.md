# Calculator API — Node.js

![CI](https://github.com/opinaka-attik/cnam-calculator-api-js/actions/workflows/ci.yml/badge.svg)

API REST de calculatrice en Node.js pur (sans framework), avec tests unitaires et d’intégration Jest.

## Démarrage rapide

```bash
npm install
npm start
```

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm start` | Démarre le serveur |
| `npm run lint` | Analyse ESLint |
| `npm test` | Lance tous les tests |
| `npm run test:unit` | Tests unitaires uniquement |
| `npm run test:integration` | Tests d’intégration uniquement |
| `npm run test:coverage` | Tests + rapport de couverture |

## Endpoints

```
GET /calculate?operation={add|subtract|multiply|divide}&a={n}&b={n}
```

## Stack technique

- **Runtime** : Node.js 18/20/22
- **Tests** : Jest 29
- **Lint** : ESLint 9
- **CI** : GitHub Actions
- **Conteneur** : Docker
