# Projet Backend Spring Boot 3 - Laboratoire LIAS

Ce dossier `backend` contient l'implémentation complète en **Java 17/21** et **Spring Boot 3** du système de gestion du Laboratoire LIAS, avec architecture en couches (Entity JPA, Repository, Service, Controller REST, Spring Security 6 & JWT).

---

## 🛠️ Stack Technique Spring Boot
- **Framework :** Spring Boot 3.3.4
- **Langage :** Java 17 ou 21
- **Sécurité :** Spring Security 6 avec filtre JWT sans état (`Stateless`) et chiffrement BCrypt
- **Persistance :** Spring Data JPA (Hibernate)
- **Base de données :**
  - **Par défaut (Développement/Test) :** H2 In-Memory (base intégrée sans besoin d'installer de SGBD externe, console accessible sur `http://localhost:8080/h2-console`)
  - **Production :** PostgreSQL (pilote inclus dans le `pom.xml`)
- **Productivité :** Lombok (`@Getter`, `@Setter`, `@Builder`, etc.)
- **Validation :** Bean Validation (`@Valid`, `@NotBlank`, `@Email`)

---

## 🚀 Démarrage Rapide

### Prérequis
- **JDK 17** ou supérieur installé (`java -version`)
- **Apache Maven 3.8+** (`mvn -v`) ou IntelliJ IDEA / Eclipse / VS Code

### Lancer l'application
Dans un terminal, placez-vous dans ce dossier et lancez :
```bash
cd backend
mvn clean spring-boot:run
```
L'application démarre sur le port **`8080`**.

---

## 🔑 Comptes de Test Initialisés Automatiquement
`DataInitializer` charge les données à chaque démarrage.

| Rôle | Statut | Email | Mot de passe |
|---|---|---|---|
| Directeur (mandat actif) | Permanent | `director@lias.com` | `director123` |
| Administrateur système | Permanent | `admin@lias.com` | `admin123` |
| Vice-directrice | Permanent | `s.elfilali@lias.com` | `member123` |
| Chef d'équipe SCIC | Permanent | `a.belangour@lias.com` | `member123` |
| Membre | Doctorant | `fz.alaoui@lias.com` | `member123` |
| Membre | Associé | `o.tazi@lias.com` | `member123` |
| Membre | Retraité (compte gelé, connexion refusée) | `m.bousbaa@lias.com` | `member123` |
| Membre | Ancien membre (compte désactivé, connexion refusée) | `r.elhaddad@lias.com` | `member123` |

## 📡 Endpoints principaux
- **Public** : `GET /api/lab-info`, `/teams`, `/members`, `/publications?author&year&teamId`, `/events?year&month`, `/mandates`, `/search?q=` ; `POST /api/applications` (demande d'adhésion).
- **Authentification** : `POST /api/auth/login`, `POST /api/auth/register` (dépose une demande, ne crée pas de compte).
- **Membre connecté** : `GET/PUT /api/members/me`, `GET /api/members/{id}/profile`, `GET /api/members/{id}/history`, `/notifications`, `POST /api/publications`.
- **Modules internes** (hors doctorants ; associés en lecture seule) : `/documents` (upload multipart, `/{id}/download`, `/{id}/versions`), `/messages`, `/equipment`, `/equipment/distribution`, `/equipment-requests`, `/meetings`, `/conventions`.
- **Directeur en mandat** : `GET /api/applications`, `POST /api/applications/{id}/decision`, `POST /api/mandates`, `POST /api/members/{id}/role`, `POST /api/events`, `POST /api/events/{id}/archive`, `/equipment*` (écriture), `/conventions`, `/meetings`, `GET /api/reports/annual/{year}?format=markdown`.
- **Admin ou directeur** : `POST /api/members/{id}/freeze|deactivate|reactivate`, `GET /api/audit`.

---

## 🔗 Connexion avec le Frontend React
Le frontend React communique par défaut avec l'API REST sur le préfixe `/api`.
Dans `vite.config.ts`, la règle proxy redirige `/api` vers `http://localhost:8080`.
