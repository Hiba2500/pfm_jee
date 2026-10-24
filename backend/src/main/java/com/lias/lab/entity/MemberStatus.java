package com.lias.lab.entity;

/** Statut d'appartenance (section 2). Strictement distinct du rôle de responsabilité (section 21). */
public enum MemberStatus {
    PERMANENT,   // membre permanent
    ASSOCIATED,  // membre associé (autre laboratoire)
    PHD_STUDENT, // doctorant
    RETIRED,     // retraité : compte gelé
    FORMER       // ancien membre : compte désactivé (réactivable)
}
