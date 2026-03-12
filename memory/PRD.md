# Guardian News - Plateforme OSINT Cybersécurité

## Vue d'ensemble
Guardian News est une plateforme d'intelligence cybersécurité qui agrège les flux RSS des principales agences de sécurité mondiales et génère des analyses automatisées.

## Architecture

### Backend (FastAPI + MongoDB)
- **Déploiement**: Render
- **Base de données**: MongoDB Atlas
- **Endpoints**:
  - `GET /health` - Healthcheck
  - `GET /api/news` - Liste des actualités (pagination, filtres)
  - `GET /api/news/{id}` - Détail d'un article
  - `GET /api/news/tension` - Niveau de menace
  - `POST /api/news/ai-summary` - Résumé IA
  - `GET /api/dashboard/metrics` - Métriques dashboard
  - `GET /api/dashboard/radar` - Données radar
  - `GET /api/dashboard/timeline` - Timeline événements

### Frontend (React + Vite + Tailwind)
- **Déploiement**: Vercel
- **Variable d'environnement**: `VITE_API_URL`

## Fonctionnalités Implémentées ✅

### Homepage (/)
- [x] Hero section avec radar animé (Framer Motion)
- [x] Titre "Veille cybersécurité en temps réel"
- [x] Navigation responsive (Accueil, Dashboard, Actualités, Paramètres)
- [x] Niveau de Menace Global (score, alertes, vulnérabilités, sources)
- [x] Graphique d'évolution sur 7 jours (Recharts LineChart)
- [x] Alertes du Jour (5 cartes avec sévérité)
- [x] Analyse Guardian AI (résumé GPT-4o)
- [x] Radar des Menaces (Recharts RadarChart)
- [x] Sources OSINT Surveillées (9 sources)
- [x] Call-to-Action vers Dashboard SOC
- [x] Footer

### Dashboard (/dashboard)
- [x] KPIs Power BI style
- [x] Résumé IA des Menaces
- [x] Graphiques et métriques

### Fil d'Actualités (/dashboard/news)
- [x] Liste paginée
- [x] Filtres (sévérité, type, recherche)
- [x] Cartes d'actualités avec badges

### Backend
- [x] Ingestion RSS automatique (10 sources, 30 min)
- [x] Classification automatique (sévérité, type de menace)
- [x] Endpoints dashboard (metrics, radar, timeline)
- [x] AI Summary avec fallback

## Stack Technique

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, TanStack Query
- **Backend**: Python 3.11, FastAPI, Motor (MongoDB async), APScheduler
- **Déploiement**: Render (backend) + Vercel (frontend)

## Configuration

### Variables d'environnement Backend
```
MONGO_URL=mongodb+srv://...
DB_NAME=guardian_news
FRONTEND_URL=https://your-app.vercel.app
EMERGENT_LLM_KEY=... (optionnel)
```

### Variables d'environnement Frontend
```
VITE_API_URL=https://your-api.onrender.com
```

## Prochaines Étapes

### P0 - Haute Priorité
- [ ] Pipeline backend pour enrichir les articles avec AI lors de l'ingestion

### P1 - Moyenne Priorité
- [ ] Page "Se Protéger" (parcours d'apprentissage)
- [ ] Mode sombre/clair toggle

### P2 - Basse Priorité
- [ ] Notifications push
- [ ] Export PDF des rapports
- [ ] Dashboard avancé "Command Center"

## Date de Mise à Jour
2026-03-12
