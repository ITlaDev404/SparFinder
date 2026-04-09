# SparFinder - Documentation Complète

## Table des Matières
1. [Présentation du Projet](#présentation-du-projet)
2. [Architecture Technique](#architecture-technique)
3. [Structure du Projet](#structure-du-projet)
4. [Base de Données](#base-de-données)
5. [API Backend](#api-backend)
6. [Frontend](#frontend)
7. [Authentification](#authentification)
8. [Guide d'Installation](#guide-dinstallation)
9. [Fonctionnalités](#fonctionnalités)

---

## 1. Présentation du Projet

**SparFinder** est une application web complète permettant aux combattants de trouver des partenaires d'entraînement (sparring partners) dans les sports de combat.

### Fonctionnalités principales :
- Inscription/Connexion utilisateur
- Recherche de partenaires par critères (taille, poids, niveau, pays)
- Gestion des demandes de sparring (envoyer, accepter, refuser)
- Système de messagerie entre utilisateurs
- Gestion du profil (sports pratiqués, localisation)
- Interface d'administration pour supprimer des utilisateurs

---

## 2. Architecture Technique

### Stack technologique :
| Composant | Technologie |
|-----------|-------------|
| Frontend | React 19 + Vite + TypeScript |
| Backend | Elysia (Bun) + TypeScript |
| Base de données | MySQL (MariaDB) |
| ORM | Drizzle ORM |
| Authentification | JWT + bcrypt |
| CSS | TailwindCSS |

### Ports utilisés :
- **Frontend** : `http://localhost:5173`
- **Backend** : `http://localhost:3000`
- **Swagger** : `http://localhost:3000/swagger`
- **MySQL** : `localhost:3306`

---

## 3. Structure du Projet

```
SparFinder/
├── SparFinder_Backend/           # Backend API
│   ├── src/
│   │   ├── db/
│   │   │   └── database.ts       # Configuration BDD
│   │   ├── models/
│   │   │   ├── index.ts          # Export des modèles
│   │   │   ├── user.ts           # Modèle utilisateur
│   │   │   ├── sport.ts          # Modèle sport
│   │   │   ├── sparring.ts       # Modèle demande sparring
│   │   │   └── message.ts        # Modèle message
│   │   ├── routes/
│   │   │   ├── user.ts           # Routes utilisateurs
│   │   │   ├── sparring.ts       # Routes sparring
│   │   │   └── message.ts        # Routes messages
│   │   ├── utils/
│   │   │   └── auth.ts           # Fonctions auth (JWT/bcrypt)
│   │   └── index.ts              # Point d'entrée backend
│   ├── sparfinder_DB.sql         # Script SQL BDD
│   ├── package.json
│   └── .env                       # Variables d'environnement
│
└── SparFinder_Frontend/          # Application React
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx        # Navigation principale
    │   │   ├── ProtectedRoute.tsx# Protection routes
    │   │   ├── Toast.tsx         # Notifications
    │   │   └── Loader.tsx         # Loader
    │   ├── pages/
    │   │   ├── home.tsx          # Page d'accueil
    │   │   ├── login.tsx         # Connexion
    │   │   ├── signup.tsx        # Inscription
    │   │   ├── search.tsx        # Recherche partenaires
    │   │   ├── profile.tsx       # Profil utilisateur
    │   │   ├── my-requests.tsx   # Mes demandes
    │   │   ├── messages.tsx      # Liste conversations
    │   │   ├── chat.tsx          # Conversation
    │   │   └── admin.tsx         # Page admin
    │   ├── utils/
    │   │   └── api.ts            # Appels API
    │   ├── App.tsx               # Router principal
    │   ├── main.tsx              # Point d'entrée
    │   └── index.css             # Styles globaux
    ├── index.html
    ├── package.json
    └── vite.config.ts             # Configuration Vite
```

---

## 4. Base de Données

### Schéma des tables :

```sql
-- Table Utilisateur
User (
    ID              INT PRIMARY KEY AUTO_INCREMENT
    Email           VARCHAR(255) UNIQUE NOT NULL
    Password        VARCHAR(255) NOT NULL      -- Hash bcrypt
    FirstName       VARCHAR(100)
    LastName        VARCHAR(100)
    Height          INT                        -- Taille en cm
    Weight          INT                        -- Poids en kg
    Level           VARCHAR(50)                -- Debutant/Intermediaire/Avance/Expert
    Country         VARCHAR(100)               -- Pays
    Region          VARCHAR(100)               -- Region
    IsAdmin         VARCHAR(10) DEFAULT 'false'-- Statut admin
)

-- Table Sports
Sport (
    ID              INT PRIMARY KEY AUTO_INCREMENT
    Name            VARCHAR(100) UNIQUE NOT NULL
    Description     TEXT
)

-- Table Sports pratiqués par utilisateur
UserSport (
    ID              INT PRIMARY KEY AUTO_INCREMENT
    UserID          INT NOT NULL (FK User)
    SportID         INT NOT NULL (FK Sport)
    UNIQUE(UserID, SportID)
)

-- Table Demandes de sparring
SparringRequest (
    ID              INT PRIMARY KEY AUTO_INCREMENT
    SenderID        INT NOT NULL (FK User)
    ReceiverID      INT NOT NULL (FK User)
    SportID         INT NOT NULL (FK Sport)
    Message         VARCHAR(500)
    Status          VARCHAR(20) DEFAULT 'pending'  -- pending/accepted/rejected
    CreatedAt       VARCHAR(50)
)

-- Table Messages
Message (
    ID              INT PRIMARY KEY AUTO_INCREMENT
    SenderID        INT NOT NULL (FK User)
    ReceiverID      INT NOT NULL (FK User)
    Content         TEXT NOT NULL
    CreatedAt       VARCHAR(50)
)
```

---

## 5. API Backend

### Routes utilisateurs (`/api/users`)

| Methode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste tous les utilisateurs | JWT |
| GET | `/:id` | Obtenir un utilisateur | - |
| POST | `/` | Créer un compte | - |
| POST | `/login` | Connexion | - |
| PUT | `/:id` | Modifier profil | JWT |
| DELETE | `/:id` | Supprimer compte | JWT |
| POST | `/:id/sports` | Ajouter un sport | JWT |
| DELETE | `/:id/sports/:sportId` | Supprimer un sport | JWT |
| GET | `/:id/sports` | Obtenir sports utilisateur | - |
| GET | `/sports` | Liste tous les sports | - |

### Routes sparring (`/api/sparring`)

| Methode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/received/:userId` | Demandes reçues | JWT |
| GET | `/sent/:userId` | Demandes envoyées | JWT |
| POST | `/` | Envoyer une demande | JWT |
| PUT | `/:id/accept` | Accepter demande | JWT |
| PUT | `/:id/reject` | Refuser demande | JWT |
| DELETE | `/:id` | Supprimer demande | JWT |

### Routes messages (`/api/messages`)

| Methode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste tous les messages | JWT |
| GET | `/conversation/:u1/:u2` | Messages entre 2 utilisateurs | JWT |
| POST | `/` | Envoyer un message | JWT |

---

## 6. Frontend

### Pages :

1. **Home** (`/`) - Page d'accueil publique
2. **Login** (`/login`) - Connexion utilisateur
3. **SignUp** (`/signup`) - Inscription
4. **Search** (`/search`) - Recherche partenaires (protégée)
5. **Profile** (`/profile/:id`) - Profil utilisateur (protégée)
6. **MyRequests** (`/my-requests`) - Gestion demandes (protégée)
7. **Messages** (`/messages`) - Liste conversations (protégée)
8. **Chat** (`/chat/:userId`) - Conversation (protégée)
9. **Admin** (`/admin`) - Panel admin (protégée, admin only)

### Composants :

- **Navbar** : Navigation avec liens conditionnels (Admin si isAdmin)
- **ProtectedRoute** : Protège les routes nécessite-auth
- **Toast** : Système de notifications
- **Loader** : Indicateur de chargement

---

## 7. Authentification

### Workflow :

1. **Inscription** : Password hashé avec bcrypt (salt 10 rounds)
2. **Connexion** : Vérification password, génération JWT
3. **API calls** : Token envoyé dans header `Authorization: Bearer <token>`
4. **Middleware** : Vérification JWT sur routes protégées
5. **Rôles** : Admin (isAdmin = 'true') peut supprimer utilisateurs

### Sécurité :
- Password jamais stocké en clair
- JWT avec expiration 7 jours
- Vérification ownership sur PUT/DELETE
- Vérification isAdmin pour routes sensibles

---

## 8. Guide d'Installation

### Prérequis :
- Bun installé
- Docker avec MariaDB

### Étapes :

```bash
# 1. Base de données
docker run -d --name my-mariadb -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mariadb

# 2. Créer les tables
docker exec -i my-mariadb mariadb -u root -proot < SparFinder_Backend/sparfinder_DB.sql

# 3. Backend
cd SparFinder_Backend
bun install
# Créer fichier .env avec les variables ci-dessous

# 4. Frontend
cd SparFinder_Frontend
bun install
bun run dev
```

### Variables d'environnement (.env) :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=sparfinder
JWT_SECRET=votre-secret-jwt-securise
```

---

## 9. Fonctionnalités

### Utilisateur :
- ✅ Inscription/Connexion
- ✅ Recherche avec filtres (taille, poids, niveau, pays)
- ✅ Envoyer demande de sparring
- ✅ Accepter/Refuser demandes
- ✅ Ajouter/supprimer sports pratiqués
- ✅ Modifier profil (pays, région, taille, poids, niveau)
- ✅ Envoyer/recevoir messages

### Admin :
- ✅ Voir liste utilisateurs
- ✅ Supprimer utilisateurs (pas les autres admins)
- ✅ Lien Admin dans navbar

---

## 10. Développeur

Créé par l'équipe SparFinder - 2024

### Compte Admin par défaut :
- Email : `admin@sparfinder.fr`
- Mot de passe : `admin123`