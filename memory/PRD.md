# Guardian News - Plateforme OSINT Cybersécurité

## Vue d'ensemble
Guardian News est une plateforme d'intelligence cybersécurité qui agrège les flux RSS des principales agences de sécurité mondiales et génère des analyses automatisées.

## Architecture

### Backend (FastAPI + MongoDB)
- **Déploiement**: Render
- **Base de données**: MongoDB Atlas
- **Endpoints API**:
  - `GET /health` - Healthcheck
  - `GET /api/news` - Liste des actualités
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
- [x] Navigation responsive (Accueil, Dashboard, Actualités, Paramètres)
- [x] Niveau de Menace Global avec graphique 7 jours
- [x] Alertes du Jour
- [x] Analyse Guardian AI
- [x] Radar des Menaces (Recharts)
- [x] Sources OSINT Surveillées
- [x] Call-to-Action vers Dashboard

### Dashboard (/dashboard)
- [x] KPIs Power BI style
- [x] **3 modes AI Summary** :
  - Simple (grand public)
  - Exécutif (décideurs avec Impact Business et Recommandations)
  - Analyste (professionnels avec CVE, outils, mitigation)
- [x] Graphiques Radar et Timeline

### Navigation
- [x] **Ordre sidebar** : Accueil, Tableau de bord, Fil d'actualités, Attaques, Outils, Urgence, Sources, Paramètres
- [x] **Logo cliquable** → redirection vers /
- [x] **ScrollToTop** automatique lors des changements de route
- [x] Bottom nav mobile (5 items)

### Page Sources (/dashboard/sources) - NOUVEAU
- [x] 11 sources OSINT avec cartes
- [x] CERT-FR, ANSSI, CISA, OWASP, Microsoft Security, KrebsOnSecurity, BleepingComputer, Dark Reading, Malwarebytes, Cisco Talos, Google Threat Intelligence
- [x] Badges de catégorie (Gouvernement, Enterprise, Média, Indépendant)
- [x] Boutons "Visiter le site" (ouvre nouvelle tab)
- [x] Section "Comment fonctionne la surveillance"

### Paramètres (/dashboard/parametres)
- [x] Dark mode toggle **SUPPRIMÉ** (thème sombre permanent SOC)
- [x] Langue d'affichage (FR/EN)
- [x] Mode d'affichage (Grand public/Professionnel)
- [x] Section À propos

## Stack Technique

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, TanStack Query
- **Backend**: Python 3.11, FastAPI, Motor (MongoDB async), APScheduler
- **Déploiement**: Render (backend) + Vercel (frontend)

## Composants Créés/Modifiés

| Fichier | Description |
|---------|-------------|
| `ScrollToTop.tsx` | Reset scroll position on route change |
| `SourcesPage.tsx` | Nouvelle page des sources OSINT |
| `AppShell.tsx` | Refactorisé avec nouveau menu |
| `SettingsPage.tsx` | Sans dark mode toggle |
| `AIThreatSummaryReal.tsx` | 3 modes (Simple, Exécutif, Analyste) |
| `SimpleDashboard.tsx` | Logo cliquable, menu "Accueil" ajouté |

## Tests Passés ✅
- Navigation Sidebar Order
- Logo Clickable Functionality  
- ScrollToTop Functionality
- Sources Page (11 sources)
- AI Summary 3 Modes
- Settings (pas de dark mode)
- Mobile Responsiveness

## Prochaines Étapes

### P1 - Moyenne Priorité
- [ ] Pipeline backend pour enrichir les articles avec AI lors de l'ingestion
- [ ] Page "Se Protéger" (parcours d'apprentissage)

### P2 - Basse Priorité
- [ ] Notifications push
- [ ] Export PDF des rapports
- [ ] Dashboard avancé "Command Center"

## Date de Mise à Jour
2026-03-13
