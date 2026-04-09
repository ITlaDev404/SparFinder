# SparFinder

Application web pour trouver des partenaires d'entraînement dans les sports de combat.

## Stack Technique

| Partie | Technologie |
|--------|-------------|
| Frontend | React 19 + Vite + TailwindCSS |
| Backend | Elysia (Bun) + Drizzle ORM |
| Base de données | MySQL |
| Auth | JWT + bcrypt |

## Installation

```bash
# Backend
cd SparFinder_Backend
bun install
# Créer fichier .env avec DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET

# Frontend
cd SparFinder_Frontend
bun install
```

## Lancement

```bash
# Terminal 1 - Backend (port 3000)
cd SparFinder_Backend
bun run dev

# Terminal 2 - Frontend (port 5173)
cd SparFinder_Frontend
bun run dev
```

## Structure des routes API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/users | Inscription |
| POST | /api/users/login | Connexion |
| GET | /api/users | Liste utilisateurs (auth) |
| GET | /api/users/:id | Profil utilisateur |
| PUT | /api/users/:id | Modifier profil |
| GET | /api/users/:id/sports | Sports d'un utilisateur |
| GET | /api/users/sports | Liste tous sports |
| GET | /api/sparring/received/:userId | Demandes reçues |
| GET | /api/sparring/sent/:userId | Demandes envoyées |
| POST | /api/sparring | Créer demande |
| PUT | /api/sparring/:id/accept | Accepter |
| PUT | /api/sparring/:id/reject | Refuser |
| GET | /api/messages/conversation/:u1/:u2 | Messages |
| POST | /api/messages | Envoyer message |

## Pages

- `/` - Page d'accueil
- `/login` - Connexion
- `/signup` - Inscription
- `/search` - Rechercher partenaires
- `/my-requests` - Mes demandes
- `/messages` - Conversations
- `/chat/:userId` - Chat individuel
- `/profile/:id` - Profil utilisateur

## Swagger

Documentation API disponible sur `http://localhost:3000/swagger`

# créer une base 
# lancer ce script 
docker run -d \
  --name my-mariadb-2 \
  -e MARIADB_ROOT_PASSWORD=root \
  -e MARIADB_DATABASE=pigeonAIR \
  -p 3307:3306 \
  mariadb:latest

# accès à la base si on utilise docker ou activer le service 

docker start my-mariadb
docker exec -it my-mariadb mariadb -u root -p
# en suit on copie colle le fichier 
sparfinder_DB.sql