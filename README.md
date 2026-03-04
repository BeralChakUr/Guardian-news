# Guardian News - Cyber Awareness Platform

## Architecture Monorepo

```
guardian-news/
├── apps/
│   ├── mobile/          # Expo React Native (SDK 55)
│   └── web/             # React Vite + Tailwind
├── backend/             # FastAPI + MongoDB
├── packages/
│   └── shared-types/    # Types TypeScript partagés
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## Prérequis

- Node.js >= 18
- PNPM >= 8
- Python >= 3.10
- MongoDB

## Installation

```bash
# Installer pnpm
npm install -g pnpm

# Installer toutes les dépendances
pnpm install

# Build les types partagés
pnpm build:types
```

## Développement

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Mobile (Expo)
```bash
pnpm dev:mobile
# ou
cd apps/mobile && pnpm start
```

### Web (Vite)
```bash
pnpm dev:web
# ou
cd apps/web && pnpm dev
```

## Variables d'environnement

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=guardian_news
```

### Mobile (apps/mobile/.env)
```
EXPO_PUBLIC_API_URL=http://localhost:8001
```

### Web (apps/web/.env)
```
VITE_API_URL=http://localhost:8001
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /api/v1/news | Liste paginée des actualités |
| GET /api/v1/news/:id | Détail d'une actualité |
| GET /api/v1/news/tension | Indice de tension cyber |

## Stack Technique

### Backend
- FastAPI
- MongoDB (Motor)
- APScheduler (ingestion RSS)
- Pydantic

### Mobile
- Expo SDK 55
- React Native
- Expo Router
- Zustand + AsyncStorage

### Web
- React 18
- Vite
- Tailwind CSS
- TanStack Query
- React Router
- Zustand

### Partagé
- TypeScript
- @guardian/shared-types
