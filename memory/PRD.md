# Guardian News - Plateforme de Cyber Intelligence

## Énoncé du Problème Original
Construire une plateforme complète d'intelligence en cybersécurité appelée "Guardian News" avec :
- Agrégation de flux RSS de sources cybersécurité (CERT-FR, CISA, etc.)
- Classification automatique des menaces par sévérité et type
- Résumés IA générés automatiquement en français
- Tableaux de bord pour le grand public et les professionnels

## Personas Utilisateurs
1. **Grand Public** : Veut comprendre les menaces actuelles simplement
2. **Professionnels IT** : Besoin de détails techniques et d'actions recommandées
3. **Décideurs** : Vue stratégique avec impact business

## Fonctionnalités Implémentées ✅

### Backend (FastAPI + MongoDB)
- [x] Ingestion RSS automatique (10+ sources, toutes les 30 min)
- [x] Classification automatique (sévérité, type de menace)
- [x] Calcul de l'indice de tension cyber en temps réel
- [x] API REST complète (/api/news, /api/news/tension, /api/news/{id})
- [x] Endpoint AI Summary POST /api/news/ai-summary
- [x] Cache des résumés IA (1h) pour optimiser les crédits
- [x] Déduplication des articles par URL et similarité de titre

### Frontend Web (React + Vite + TailwindCSS)
- [x] Dashboard "Power BI style" avec KPIs
- [x] Résumé IA des Menaces avec 3 modes (Simple, Exécutif, Analyste)
- [x] Page d'actualités avec filtres (Gravité, Type de menace)
- [x] Recherche par mot-clé
- [x] Design responsive (mobile + desktop)
- [x] Interface entièrement en français
- [x] Navigation sidebar (desktop) + bottom nav (mobile)

### Intégration IA
- [x] Emergent LLM Key (GPT-4o) pour génération des résumés
- [x] Traduction automatique des titres en français
- [x] Extraction d'informations clés et actions recommandées

## Bugs Corrigés (Session Actuelle)

### Bug 1: AI Summary ne fonctionnait pas (P0) ✅ RÉSOLU
- **Cause** : API `LlmChat` utilisait `send_message(string)` au lieu de `send_message(UserMessage)`
- **Fix** : Import de `UserMessage` et utilisation correcte

### Bug 2: Filtres causaient écran blanc (P1) ✅ RÉSOLU
- **Cause** : Référence à variable `level` non définie dans le compteur de filtres
- **Fix** : Supprimé les références à `level` dans ActusPage.tsx

### Bug 3: Badge "Niveau Technique" à supprimer (P1) ✅ DÉJÀ FAIT
- Les badges ont été supprimés dans la session précédente
- Vérifié que NewsCard.tsx n'affiche plus de badge "Intermédiaire"

## Architecture Technique

```
/app
├── apps/web/           # Frontend React + Vite
│   ├── src/
│   │   ├── components/ # AIThreatSummaryReal, NewsCard, etc.
│   │   ├── pages/      # SimpleDashboard, ActusPage
│   │   └── services/   # apiClient, newsService
│   └── .env            # VITE_API_URL
├── backend/            # FastAPI
│   ├── server.py       # API + RSS ingestion + AI
│   └── .env            # MONGO_URL, EMERGENT_LLM_KEY
└── packages/shared-types/
```

## Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/news | Liste paginée avec filtres |
| GET | /api/news/{id} | Détail d'un article |
| GET | /api/news/tension | Indice de tension cyber |
| POST | /api/news/ai-summary | Génération résumé IA |

## Prochaines Étapes (Backlog)

### P0 - Haute Priorité
- [ ] Refactorer l'AI Summary vers un pipeline backend (enrichir les articles lors de l'ingestion)

### P1 - Moyenne Priorité  
- [ ] Page "Se Protéger" (parcours d'apprentissage)
- [ ] Dashboard avancé "Command Center" pour analystes

### P2 - Basse Priorité
- [ ] Notifications push pour alertes critiques
- [ ] Export PDF des rapports
- [ ] Mode sombre/clair toggle

## Date de Mise à Jour
2026-03-09
