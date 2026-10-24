# LIAS Laboratory Management System

Bienvenue sur le système de gestion du Laboratoire LIAS (Laboratoire d'Ingénierie, Systèmes et Applications).

## 🏛️ Architecture du Projet

Le projet propose une architecture complète découplée et conforme aux standards académiques et industriels :

1. **Backend Spring Boot 3 (Java 17/21) :** Situé dans le dossier `/backend`.
   - **Framework :** Spring Boot 3.3.4 (Java 17/21).
   - **Sécurité :** Spring Security 6 avec authentification par JSON Web Token (JWT) sans état.
   - **Persistance :** Spring Data JPA (Hibernate) avec support H2 (in-memory immédiat) et PostgreSQL.
   - **Contrôleurs REST :** Authentification (`/api/auth`), Équipes (`/api/teams`), Publications (`/api/publications`), Événements (`/api/events`), Membres (`/api/members`).
   - Démarrage : `cd backend && mvn spring-boot:run`.

2. **Frontend Web & Aperçu Interactif :**
   - **Technologies :** React 19, TypeScript, Tailwind CSS, Lucide Icons, React Router 7.
   - Fournit l'interface utilisateur complète (Espaces Directeur, Administrateur, Membre Chercheur, Doctorant et Espace Public).
   - En environnement de test interactif direct, une couche API Express/TypeScript miroir assure l'exécution en temps réel dans le navigateur sur le port 3000 avec les mêmes contrats REST que Spring Boot.

## 🔑 Comptes de Démonstration Pré-Configurés

- **Directeur de Laboratoire :** `director@lias.com` / `director123`
- **Administrateur Système :** `admin@lias.com` / `admin123`
- **Vice-Directrice & Chercheure :** `s.elfilali@lias.com` / `member123`
- **Doctorante Chercheure :** `fz.alaoui@lias.com` / `member123`
