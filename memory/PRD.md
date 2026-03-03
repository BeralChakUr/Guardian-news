# CyberGuard - Application de Veille Cybersécurité

## Vue d'ensemble
CyberGuard est une application mobile-first de veille en cybersécurité conçue pour le grand public et les TPE/PME françaises. Elle offre des informations synthétisées et des actions concrètes pour se protéger en ligne.

## Architecture Technique

### Stack
- **Frontend**: React Native / Expo Router (tab-based navigation)
- **State Management**: Zustand + AsyncStorage
- **Backend**: FastAPI + MongoDB (prêt pour API)
- **Theme**: Dark mode par défaut avec support light mode

### Structure des fichiers
```
/app/frontend/
├── app/
│   ├── _layout.tsx          # Tab navigation layout
│   ├── index.tsx            # Tab 1: Actus (News)
│   ├── attacks.tsx          # Tab 2: Attaques (Attack catalog)
│   ├── protect.tsx          # Tab 3: Se protéger (Learning)
│   ├── emergency.tsx        # Tab 4: Urgence (Emergency)
│   └── toolbox.tsx          # Tab 5: Boîte à outils
├── src/
│   ├── types/index.ts       # TypeScript interfaces
│   ├── data/
│   │   ├── mockNews.ts      # Mock news data
│   │   ├── mockAttacks.ts   # Attack catalog data
│   │   ├── mockLearning.ts  # Learning modules
│   │   ├── mockEmergency.ts # Emergency scenarios
│   │   └── mockTools.ts     # Tools & glossary
│   ├── store/appStore.ts    # Zustand store
│   ├── theme/colors.ts      # Theme definitions
│   └── components/
│       └── NewsCard.tsx     # Reusable news card
```

## Fonctionnalités Implémentées (v1)

### Tab 1 - Actus
- ✅ Feed d'actualités cybersécurité
- ✅ Cartes news avec TL;DR, impact, actions
- ✅ Filtres (gravité, niveau)
- ✅ Recherche
- ✅ Favoris et "Lire plus tard"
- ✅ Indice de menace global
- ✅ Résumé du jour
- ✅ Modal détail avec actions concrètes

### Tab 2 - Attaques
- ✅ Catalogue de types d'attaques
- ✅ Filtrage par catégorie
- ✅ Fiches détaillées (définition, exemple, signes, impacts)
- ✅ Mesures de prévention
- ✅ Actions si victime

### Tab 3 - Se protéger
- ✅ Parcours progressif (4 niveaux)
- ✅ Leçons micro-learning
- ✅ Quiz interactifs avec feedback
- ✅ Système de points
- ✅ Badges de progression
- ✅ Streak de veille
- ✅ Suivi de progression

### Tab 4 - Urgence
- ✅ 6 scénarios d'incident
- ✅ Actions immédiates priorisées
- ✅ Contacts d'urgence (FR)
- ✅ Numéros rapides (17, 112, Info Escroqueries)
- ✅ Checklist de preuves
- ✅ Liens de signalement
- ✅ Modèles d'emails
- ✅ Partage de procédures

### Tab 5 - Boîte à outils
- ✅ Outils recommandés (10+)
- ✅ Filtrage par catégorie
- ✅ Glossaire cybersécurité (16 termes)
- ✅ Recherche glossaire
- ✅ Paramètres (dark mode, mode pro, notifications)
- ✅ Liens vers sites officiels

## Données Mock (v1)
- 6 actualités cybersécurité réalistes
- 6 types d'attaques documentées
- 4 niveaux d'apprentissage (11 leçons)
- 6 scénarios d'urgence
- 10 outils recommandés
- 16 termes de glossaire

## Stockage Local
- Favoris et "Lire plus tard" persistés
- Progression d'apprentissage
- Badges débloqués
- Streak de veille
- Préférences utilisateur

## Évolutions Prévues (v2)
- [ ] API d'agrégation de news RSS
- [ ] Notifications push
- [ ] Mode hors-ligne complet
- [ ] Text-to-Speech (TTS) pour TL;DR
- [ ] Widget quotidien
- [ ] Authentification optionnelle
- [ ] Synchronisation cloud
- [ ] Contenu régional

## Contacts FR Intégrés
- Police/Gendarmerie (17)
- Urgences européennes (112)
- Info Escroqueries (0 805 805 817)
- Cybermalveillance.gouv.fr
- Signal Spam
- Pharos (signalement)
- ANSSI
- CNIL
- Perceval (fraude CB)
- Have I Been Pwned

## Design System
### Couleurs (Dark Mode)
- Background: #0D1117
- Surface: #161B22
- Primary: #58A6FF
- Success: #3FB950
- Warning: #F0883E
- Danger: #F85149
- Accent: #7EE787

### Accessibilité
- Contraste élevé
- Touch targets 44px+
- Navigation one-hand friendly
- Icons Ionicons pour cohérence
