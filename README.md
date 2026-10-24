# 🏛️ LIAS — Système de Gestion du Laboratoire

> **Laboratoire d'Ingénierie, Systèmes et Applications (LIAS)**  
> Faculté des Sciences Ben M'Sik — Université Hassan II de Casablanca  
> *Projet JEE Enterprise Architecture — Master Data Science & Big Data*

---

## 📋 Présentation du Projet

Le système de gestion du **Laboratoire LIAS** est une plateforme web moderne et sécurisée conçue pour centraliser, administrer et valoriser l'ensemble des activités scientifiques, des ressources matérielles et de la gouvernance académique du laboratoire.

L'application respecte les principes d'architecture d'entreprise : séparation stricte des responsabilités (découplage Frontend / Backend), contrôle d'accès basé sur les rôles (**RBAC**), authentification sans état (**JWT**), traçabilité complète de toutes les opérations via un **journal d'audit immuable**, et historisation sans perte de données.

---

## 🛠️ Stack Technique

### Backend (Spring Boot 3)
- **Framework :** Spring Boot 3.3.4
- **Langage :** Java 17 / 21 LTS
- **Sécurité :** Spring Security 6 avec filtre JWT stateless et hachage BCrypt
- **Persistance :** Spring Data JPA (Hibernate ORM)
- **Base de données :**
  - **Développement / Démo :** H2 In-Memory (initialisation automatique avec console sur `/h2-console`)
  - **Production :** PostgreSQL (pilote inclus dans le `pom.xml`)
- **Productivité :** Project Lombok, Jakarta Validation

### Frontend (React + TypeScript)
- **Framework :** React 19 & TypeScript
- **Bundler :** Vite 6
- **Styling :** Tailwind CSS
- **Icônes :** Lucide React
- **Routage :** React Router
- **Proxy API :** Proxy inverse Vite `/api` vers `http://localhost:8080`

---

## 📂 Structure du Répertoire

```text
lias/
├── backend/                  # Application Spring Boot 3 (Java 21)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/lias/lab/
│   │   │   │   ├── config/       # Initialisation des données (DataInitializer)
│   │   │   │   ├── controller/   # Contrôleurs REST
│   │   │   │   ├── dto/          # Data Transfer Objects
│   │   │   │   ├── entity/       # Entités JPA (Membres, Mandats, Événements, etc.)
│   │   │   │   ├── repository/   # Interfaces Spring Data JPA
│   │   │   │   ├── security/     # Configuration Spring Security & JWT
│   │   │   │   └── service/      # Services métier
│   │   │   └── resources/        # application.properties
│   ├── uploads/                  # Répertoire de stockage des documents
│   ├── pom.xml                   # Configuration Maven
│   └── README.md                 # Documentation détaillée du backend
│
├── frontend/                 # Application React 19 + TypeScript
│   ├── public/               # Assets statiques et logo
│   ├── src/
│   │   ├── components/       # Composants partagés et mise en page
│   │   ├── context/          # Contextes (Langue FR/EN, Auth)
│   │   ├── lib/              # Client API HTTP
│   │   ├── pages/
│   │   │   ├── auth/         # Connexion et Inscription
│   │   │   ├── dashboard/    # Tableaux de bord (Directeur, Admin, Membre)
│   │   │   └── public/       # Portail public (Accueil, Équipes, Publications, etc.)
│   │   └── types.ts          # Modèles TypeScript
│   ├── package.json          # Dépendances npm
│   ├── vite.config.ts        # Configuration Vite et proxy
│   └── README.md                 # Documentation du frontend
│
├── .gitignore                # Règles d'exclusion Git
└── README.md                 # Documentation principale du projet
```

---

## 🚀 Démarrage Rapide

### Prérequis
- **Java JDK 17** ou supérieur (`java -version`)
- **Apache Maven 3.8+** (`mvn -v`)
- **Node.js 18+** et **npm** (`node -v`, `npm -v`)

---

### 1. Lancer le Backend (Spring Boot)

Ouvrez un premier terminal à la racine du projet :

```bash
cd backend
mvn clean spring-boot:run
```

L'API REST démarre sur **`http://localhost:8080`**.  
La console H2 est accessible sur **`http://localhost:8080/h2-console`** (JDBC URL: `jdbc:h2:mem:liasdb`, User: `sa`, Mot de passe vide).

---

### 2. Lancer le Frontend (React / Vite)

Ouvrez un second terminal à la racine du projet :

```bash
cd frontend
npm install
npm run dev
```

L'application web est accessible sur **`http://localhost:3000`**.

---

## 🔑 Comptes de Démonstration Pré-configurés

La base de données est automatiquement amorcée au démarrage avec les comptes suivants :

| Rôle | Statut | Email | Mot de passe | Description & Habilitations |
|---|---|---|---|---|
| **Directeur** (Mandat actif) | Permanent | `director@lias.com` | `director123` | Validation des adhésions, mandats, attribution du matériel, conventions et PV |
| **Administrateur** | Permanent | `admin@lias.com` | `admin123` | Gestion technique des comptes, paramétrage du labo, diagnostic et journal d'audit |
| **Vice-Directrice** | Permanent | `s.elfilali@lias.com` | `member123` | Membre permanent, vice-direction |
| **Chef d'Équipe** | Permanent | `a.belangour@lias.com` | `member123` | Responsable de l'équipe SCIC |
| **Doctorante** | Doctorant | `fz.alaoui@lias.com` | `member123` | Profil doctorant, gestion des publications |
| **Membre Associé** | Associé | `o.tazi@lias.com` | `member123` | Chercheur collaborateur externe |
| **Retraité** | Retraité | `m.bousbaa@lias.com` | `member123` | Compte gelé (connexion bloquée, données et historique conservés) |
| **Ancien Membre** | Ancien membre | `r.elhaddad@lias.com` | `member123` | Compte désactivé (réactivable par l'administration) |

---

## 🌟 Modules et Fonctionnalités Principales

1. **Portail Public & Vitrine Scientifique :** Présentation du laboratoire, axes de recherche, annuaire des équipes, catalogue des publications et calendrier interactif.
2. **Gouvernance & Mandats Électoraux :** Attribution et archivage des mandats officiels (Directeur, Vice-Directeur, Responsable d'équipe) sans écrasement de données.
3. **Demandes d'Adhésion en Ligne :** Formulaire de candidature pour doctorants et chercheurs avec examen et validation régalienne par le Directeur.
4. **Événements Scientifiques & Calendrier :** Programmation de colloques, séminaires doctoraux, assignation de comités d'organisation et archivage par édition.
5. **Gestion du Matériel & Distribution Équitable :** Suivi des arrivages, dotations effectives (*« Qui a reçu quoi »*) et chercheurs prioritaires (*« Qui n'a pas reçu »*).
6. **Conventions & Collaborations :** Enregistrement des partenariats universitaires et industriels, conventions de recherche et suivi des activités conjointes.
7. **Procès-Verbaux de Réunions (PV) :** Sessions de gouvernance, ordres du jour structurés, relevés des décisions actées et archivage numérique.
8. **Rapport d'Activité Annuel Automatique :** Génération annuelle automatique basée sur les événements, les publications et les indicateurs scientifiques du laboratoire.
9. **Journal d'Audit & Sécurité :** Traçabilité immuable de toutes les actions administratives, modifications de profil et changements de statut.

---

## 📄 Licence & Droits

Projet académique développé dans le cadre du Master Data Science & Big Data — Faculté des Sciences Ben M'Sik, Casablanca.
Tous droits réservés © Laboratoire LIAS.
