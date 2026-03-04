# Guardian News V2 - Plateforme de Veille Cybersécurité

## Vue d'ensemble
Guardian News est une application mobile-first de veille cybersécurité avec **ingestion RSS automatique** et données en temps réel provenant de **10 sources fiables**.

## Architecture V2

### Stack
- **Frontend**: Expo SDK 55 / React Native / Expo Router
- **Backend**: FastAPI avec ingestion RSS automatique
- **Database**: MongoDB
- **State**: Zustand + AsyncStorage (cache offline 6h TTL)

### Sources RSS (avec scores de confiance)
| Source | Score | Statut |
|--------|-------|--------|
| CERT-FR | 10 | ✅ |
| CISA | 10 | ✅ |
| The Hacker News | 7 | ✅ |
| BleepingComputer | 8 | ✅ |
| Dark Reading | 7 | ✅ |
| Krebs on Security | 8 | ✅ |
| Malwarebytes Labs | 8 | ✅ |
| Microsoft Security | 9 | ✅ |

## Backend API

### Endpoints
```
GET /api/news
  - page: int (default: 1)
  - page_size: int (default: 15, max: 50)
  - severity: critique|eleve|moyen|faible
  - type: phishing|ransomware|malware|data_leak|vuln|scam|apt|ddos|other
  - level: debutant|intermediaire|avance
  - search: string

GET /api/news/{id}

GET /api/news/tension
  - Retourne l'indice de tension cyber (score 0-100)
  - Cache TTL: 6h

POST /api/news/refresh
  - Déclenche une mise à jour manuelle des flux RSS
```

### Ingestion RSS
- **Fréquence**: Toutes les 30 minutes (scheduler APScheduler)
- **Déduplication**: Par URL hash + similarité de titre (>70%)
- **Classification automatique**:
  - Severity: basée sur mots-clés (critical, zero-day, etc.)
  - Threat type: phishing, ransomware, malware, etc.
  - Level: selon source score et severity
- **TL;DR généré**: 3 bullets max depuis le contenu

### Indice de Tension Cyber
Calcul basé sur les 24 dernières heures:
- Score = (critiques * 25) + (élevées * 10)
- Niveaux: Critique (70+), Élevé (40-69), Modéré (20-39), Faible (<20)

## Frontend Architecture

### Structure
```
src/
├── services/
│   ├── apiClient.ts      # HTTP client avec retry + déduplication
│   └── newsService.ts    # Service news (mock/API toggle)
├── hooks/
│   ├── useNews.ts        # Hook pagination + cache + anti-race condition
│   └── useTension.ts     # Hook tension avec cache 6h
├── components/
│   ├── common/
│   │   └── SkeletonLoader.tsx
│   └── news/
│       ├── TensionBanner.tsx
│       └── NewsHeader.tsx
```

### Fonctionnalités Frontend V2
- ✅ FlatList virtualisée (performance)
- ✅ Pagination infinie avec anti-race condition
- ✅ Skeleton loaders pendant chargement
- ✅ Pull-to-refresh
- ✅ Recherche avec debounce 300ms
- ✅ Filtres (gravité, niveau)
- ✅ Cache-first strategy (page 1) + background revalidation
- ✅ Bannière tension dynamique depuis API
- ✅ Mode mock/API via `EXPO_PUBLIC_USE_MOCK`

### apiClient Features
- Retry exponentiel sur 429/5xx (max 3 retries)
- Déduplication des requêtes in-flight
- Timeout configurable (default 30s)
- Gestion standardisée des erreurs

### useNews Hook
```typescript
const {
  news,        // News[]
  state,       // 'idle'|'loading'|'refreshing'|'loadingMore'|'error'|'success'
  error,       // string | null
  hasMore,     // boolean
  total,       // number
  loadMore,    // () => Promise<void>
  refresh,     // () => Promise<void>
  setFilters,  // (filters: NewsFilters) => void
  filters,     // NewsFilters
} = useNews();
```

## Variables d'environnement

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=guardian_news
```

### Frontend (.env)
```
EXPO_PUBLIC_API_URL=https://...
EXPO_PUBLIC_USE_MOCK=false
```

## Données Live
- **100 articles** ingérés depuis 10 sources
- **30 articles critiques** identifiés automatiquement
- **Mise à jour toutes les 30 minutes**

## Performance
- FlatList optimisée: `removeClippedSubviews`, `maxToRenderPerBatch=10`
- Cache offline TTL 6h
- Skeleton loaders pour UX fluide
- Debounce 300ms sur recherche

## Prochaines évolutions (V3)
- [ ] Notifications push pour alertes critiques
- [ ] Text-to-Speech pour TL;DR
- [ ] Widget iOS/Android
- [ ] Mode hors-ligne complet
- [ ] Authentification optionnelle
- [ ] Plus de sources RSS (ENISA, NVD, VulDB)
