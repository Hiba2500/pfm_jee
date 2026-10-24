package com.lias.lab.config;

import com.lias.lab.entity.*;
import com.lias.lab.repository.*;
import com.lias.lab.service.MemberLifecycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** Données de démonstration : un laboratoire avec ses équipes, membres de chaque statut, mandats et historiques. */
@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ResearchTeamRepository teamRepository;
    private final PublicationRepository publicationRepository;
    private final EventRepository eventRepository;
    private final MandateRepository mandateRepository;
    private final AffiliationPeriodRepository affiliationRepository;
    private final StatusChangeRepository statusRepository;
    private final ConventionRepository conventionRepository;
    private final MeetingMinutesRepository meetingRepository;
    private final EquipmentItemRepository equipmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final MemberLifecycleService lifecycle;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        ResearchTeam scic = teamRepository.save(ResearchTeam.builder()
                .name("Smart Cities, IoT & Cybersécurité des Systèmes").acronym("SCIC")
                .leaderName("Prof. Abdessamad Belangour")
                .description("Cybersécurité des infrastructures IA, villes intelligentes, jumeaux numériques et IoT.")
                .researchAxes(List.of("Cybersécurité & Résilience IA", "Villes Intelligentes", "IoT & Edge Computing"))
                .memberCount(8).build());
        ResearchTeam diss = teamRepository.save(ResearchTeam.builder()
                .name("Science des Données, Cloud & Systèmes Intelligents").acronym("DISS")
                .leaderName("Prof. Nawal Sael")
                .description("Big Data, Cloud computing, apprentissage automatique et systèmes intelligents.")
                .researchAxes(List.of("Machine Learning & Deep Learning", "Cloud & Big Data", "IA Finance & Transport"))
                .memberCount(7).build());
        ResearchTeam cham = teamRepository.save(ResearchTeam.builder()
                .name("IA Cognitive, Santé & Modélisation Mathématique").acronym("CHAM")
                .leaderName("Prof. Khadija Achtaich")
                .description("IA cognitive, santé inclusive et modélisation mathématique.")
                .researchAxes(List.of("IA Cognitive", "Santé Inclusive", "Modélisation Mathématique"))
                .memberCount(5).build());

        // Statut et rôle sont deux notions distinctes : directeur = rôle, permanent = statut.
        User director = member("director@lias.com", "director123", "Faouzia", "Benabbou", Role.DIRECTOR, MemberStatus.PERMANENT,
                "Professeure de l'Enseignement Supérieur, Directrice du LIAS", cham, LocalDate.of(2014, 9, 1), "FSBM", "LIAS");
        User admin = member("admin@lias.com", "admin123", "Karim", "Alami", Role.ADMIN, MemberStatus.PERMANENT,
                "Administrateur système et plateforme", null, LocalDate.of(2020, 9, 1), "FSBM", "LIAS");
        User vice = member("s.elfilali@lias.com", "member123", "Sanaa", "El Filali", Role.VICE_DIRECTOR, MemberStatus.PERMANENT,
                "Professeure Habilitée, Vice-Directrice", scic, LocalDate.of(2015, 9, 1), "FSBM", "LIAS");
        User leader = member("a.belangour@lias.com", "member123", "Abdessamad", "Belangour", Role.TEAM_LEADER, MemberStatus.PERMANENT,
                "Professeur, responsable de l'équipe SCIC", scic, LocalDate.of(2016, 9, 1), "FSBM", "LIAS");
        User phd = member("fz.alaoui@lias.com", "member123", "Fatima-Zahra", "Alaoui", Role.MEMBER, MemberStatus.PHD_STUDENT,
                "Doctorante", diss, LocalDate.of(2022, 10, 1), "FSBM", "LIAS");
        User associate = member("o.tazi@lias.com", "member123", "Omar", "Tazi", Role.MEMBER, MemberStatus.ASSOCIATED,
                "Professeur associé", diss, LocalDate.of(2021, 3, 1), "ENSAM Casablanca", "Laboratoire d'Ingénierie Industrielle");
        User retired = member("m.bousbaa@lias.com", "member123", "Mostafa", "Bousbaa", Role.MEMBER, MemberStatus.PERMANENT,
                "Professeur émérite", diss, LocalDate.of(2012, 1, 15), "FSBM", "LIAS");
        User former = member("r.elhaddad@lias.com", "member123", "Rachid", "El Haddad", Role.MEMBER, MemberStatus.PERMANENT,
                "Ancien chercheur permanent", cham, LocalDate.of(2016, 9, 1), "FSBM", "LIAS");

        List<User> all = userRepository.saveAll(List.of(director, admin, vice, leader, phd, associate, retired, former));
        for (User u : all) {
            u.setBirthDate(LocalDate.of(1975 + (int) (u.getId() % 20), 1 + (int) (u.getId() % 12), 10)); // confidentielle
            u.setHireDate(u.getAffiliationDate());
            userRepository.save(u);
            lifecycle.openHistory(u, "Adhésion initiale");
        }

        // Départs : l'historique est clôturé et conservé, jamais supprimé (sections 4.3 et 8).
        lifecycle.freeze(retired, "Départ à la retraite", null);
        lifecycle.deactivate(former, "Mobilité internationale (Chaire de recherche)", null);

        // Mandats de gouvernance (section 5.3)
        mandate(director, MandateType.DIRECTOR, null, LocalDate.of(2023, 1, 1), LocalDate.of(2027, 12, 31));
        mandate(vice, MandateType.VICE_DIRECTOR, null, LocalDate.of(2023, 9, 1), LocalDate.of(2027, 8, 31));
        mandate(leader, MandateType.TEAM_LEADER, scic, LocalDate.of(2022, 9, 1), LocalDate.of(2027, 8, 31));

        publicationRepository.saveAll(List.of(
                Publication.builder().title("Federated Learning Framework for Privacy-Preserving Smart City IoT Ecosystems")
                        .authors(new ArrayList<>(Arrays.asList("Sanaa El Filali", "Abdessamad Belangour")))
                        .year(2026).type("Journal").venue("IEEE Internet of Things Journal").doi("10.1109/JIOT.2026.338912")
                        .ownerId(vice.getId()).teamId(scic.getId()).build(),
                Publication.builder().title("Deep Neural Networks for Early Anomaly Detection in Critical Infrastructure Sensors")
                        .authors(new ArrayList<>(Arrays.asList("Fatima-Zahra Alaoui", "Nawal Sael")))
                        .year(2026).type("Conference").venue("ICAIS 2026").ownerId(phd.getId()).teamId(diss.getId()).build(),
                Publication.builder().title("Frugal AI for Inclusive Health Diagnostics")
                        .authors(new ArrayList<>(List.of("Faouzia Benabbou")))
                        .year(2025).type("Journal").venue("Springer AI & Society").ownerId(director.getId()).teamId(cham.getId()).build()));

        eventRepository.saveAll(List.of(
                Event.builder().title("ICAIS 2026 — International Conference on Advanced Information Systems").type("Conférence")
                        .series("ICAIS").edition(6).date(LocalDate.of(2026, 11, 12)).time("09:00 - 18:00")
                        .location("Amphithéâtre Central, FSBM").organizer("Comité Scientifique LIAS").build(),
                Event.builder().title("Séminaire doctoral : IA et résilience numérique").type("Séminaire")
                        .date(LocalDate.of(2026, 3, 18)).time("14:00 - 17:00").location("Salle de conférences LIAS")
                        .organizer("Équipe DISS").build(),
                Event.builder().title("Workshop Smart Cities & IoT").type("Workshop")
                        .date(LocalDate.of(2025, 5, 20)).location("FSBM").organizer("Équipe SCIC").archived(true).build()));

        conventionRepository.save(Convention.builder().title("Convention de recherche — Université de Salford")
                .partnerName("University of Salford").partnerType("INTERNATIONAL").status("ACTIVE")
                .startDate(LocalDate.of(2026, 1, 1)).endDate(LocalDate.of(2028, 12, 31))
                .description("Co-encadrement de thèses et publications conjointes.")
                .activities(new ArrayList<>(List.of("Échange de doctorants", "Atelier conjoint 2026"))).build());

        meetingRepository.save(MeetingMinutes.builder().title("Conseil de laboratoire — rentrée 2026")
                .meetingType("Conseil de laboratoire").date(LocalDate.of(2026, 9, 22)).location("Salle de réunion LIAS")
                .agenda(new ArrayList<>(List.of("Bilan annuel", "Répartition du matériel", "Calendrier des séminaires")))
                .decisions(new ArrayList<>(List.of("Adoption du calendrier 2026-2027", "Priorité du matériel aux doctorants sans dotation")))
                .secretaryName("Sanaa El Filali").build());

        equipmentRepository.saveAll(List.of(
                EquipmentItem.builder().designation("Station GPU Poste 1").category("Calcul").inventoryNumber("LIAS-GPU-001")
                        .source("Budget 2026").arrivalDate(LocalDate.of(2026, 2, 10)).build(),
                EquipmentItem.builder().designation("Station GPU Poste 2").category("Calcul").inventoryNumber("LIAS-GPU-002")
                        .source("Budget 2026").arrivalDate(LocalDate.of(2026, 2, 10)).build(),
                EquipmentItem.builder().designation("Serveur Dell rackable").category("Serveur").inventoryNumber("LIAS-SRV-001")
                        .source("Convention Salford").arrivalDate(LocalDate.of(2026, 5, 3)).build()));
    }

    private User member(String email, String password, String firstName, String lastName, Role role, MemberStatus status,
                        String title, ResearchTeam team, LocalDate affiliation, String institution, String lab) {
        return User.builder()
                .email(email).password(passwordEncoder.encode(password))
                .firstName(firstName).lastName(lastName).role(role).status(status).title(title)
                .teamId(team != null ? team.getId() : null).teamName(team != null ? team.getAcronym() : "Administration")
                .affiliationDate(affiliation).institution(institution).originLaboratory(lab).build();
    }

    private void mandate(User user, MandateType type, ResearchTeam team, LocalDate start, LocalDate end) {
        mandateRepository.save(Mandate.builder().userId(user.getId()).personName(user.fullName()).type(type)
                .teamId(team != null ? team.getId() : null).teamName(team != null ? team.getAcronym() : null)
                .startDate(start).endDate(end).build());
    }
}
