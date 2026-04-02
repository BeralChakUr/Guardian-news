# Guardian News - Plateforme OSINT Cybersécurité

## Vue d'ensemble
Guardian News est une plateforme d'intelligence cybersécurité qui agrège les flux RSS des principales agences de sécurité mondiales et génère des analyses automatisées. **Version 3 met l'accent sur l'écosystème français de cybersécurité et améliore la représentation fiable des menaces.**

## Architecture

### Backend (FastAPI + MongoDB)
- **Déploiement**: Render
- **Base de données**: MongoDB Atlas
- **Configuration sources**: `backend/config/sources.json` - métadonnées des flux RSS avec `country`, `priority`, `language`
- **Endpoints API**:
  - `GET /health` - Healthcheck
  - `GET /api/news` - Liste des actualités (supporte `?country=FR`, `?date_from`, `?date_to`)
  - `GET /api/news/{id}` - Détail d'un article
  - `GET /api/news/tension` - Niveau de menace (formule V3)
  - `POST /api/news/ai-summary` - Résumé IA
  - `GET /api/dashboard/metrics` - Métriques dashboard
  - `GET /api/dashboard/radar` - Données radar
  - `GET /api/dashboard/timeline` - Timeline événements
  - `GET /api/dashboard/news-grouped` - News groupées France/International

### Frontend (React + Vite + Tailwind)
- **Déploiement**: Vercel
- **Variable d'environnement**: `VITE_API_URL`

## Fonctionnalités Implémentées ✅

### V3 Correctifs Stratégiques (2 avril 2026) 🔧
- [x] **Tri des articles** (CRITIQUE):
  - [x] Tri global par date DESC (plus récent en premier)
  - [x] Sources mélangées (pas de groupement par source)
  - [x] Tri secondaire par gravité si même date
- [x] **Filtre par date**:
  - [x] Backend: `?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD`
  - [x] Frontend: DatePicker avec raccourcis (Aujourd'hui, 7 jours, Personnalisé)
- [x] **UTF-8**:
  - [x] Middleware backend pour headers `charset=utf-8`
  - [x] Fonction `clean_utf8_text()` pour nettoyer les données
- [x] **Calcul du niveau de menace V3**:
  - [x] Formule: `(critique*4 + élevé*3 + moyen*2 + faible*1) / total * 25`
  - [x] Basé sur 7 derniers jours
  - [x] Retourne `total_7days`, `critical_count`, `high_count`, `medium_count`, `low_count`

### V3 Cyber France (14 mars 2026) 🇫🇷
- [x] **Backend**:
  - [x] Fichier de configuration `sources.json` avec métadonnées pays/priorité/langue
  - [x] Pipeline d'ingestion RSS tague les articles avec `country`, `priority`, `language`
  - [x] Endpoint `/api/news` supporte le paramètre `?country=FR`
  - [x] Nouvel endpoint `/api/dashboard/news-grouped` (france/international)
  - [x] Migration automatique des données existantes
- [x] **Frontend**:
  - [x] `DailyAlerts.tsx` - Sections séparées "Alertes France 🇫🇷" et "Alertes Internationales 🌍"
  - [x] `NewsCard.tsx` - Badge drapeau pays (🇫🇷, 🇺🇸, etc.)
  - [x] `ActusPage.tsx` - Vue groupée/liste avec filtres par pays et date
  - [x] Responsive mobile

### Homepage (/)
- [x] Hero section avec radar animé (Framer Motion)
- [x] Navigation responsive (Accueil, Dashboard, Actualités, Paramètres)
- [x] Niveau de Menace Global avec graphique 7 jours
- [x] Alertes du Jour (France prioritaire)
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
