# SparFinder - Commandes Utiles

## Lancer l'application

### Base de données (si pas déjà démarrée)
```bash
docker start my-mariadb
```

### Backend
```bash
cd /home/dark/Documents/BTS/project/SparFinder/SparFinder_Backend
bun run dev
```
- API : http://localhost:3000
- Swagger : http://localhost:3000/swagger

### Frontend
```bash
cd /home/dark/Documents/BTS/project/SparFinder/SparFinder_Frontend
bun run dev
```
- URL : http://localhost:5173

## Scripts utiles

### Recréer la base de données
```bash
docker exec -i my-mariadb mariadb -u root -proot < /home/dark/Documents/BTS/project/SparFinder/SparFinder_Backend/sparfinder_DB.sql
```

### Créer un admin
```bash
# Créer l'utilisateur
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"email":"admin@test.fr","password":"password123","firstName":"Admin","lastName":"Test"}'

# Le rendre admin
echo "USE sparfinder; UPDATE User SET IsAdmin = 'true' WHERE Email = 'admin@test.fr';" | docker exec -i my-mariadb mariadb -u root -proot
```

## Comportement attendu

1. Page d'accueil → Redirect vers /search si connecté
2. Login → Redirect vers /admin si isAdmin=true
3. Navbar → Lien "Admin" visible uniquement pour les admins
4. Messages → Affiche les utilisateurs avec qui on a un sparring accepted
5. Chat → Impossible si pas de sparring accepté avec cette personne