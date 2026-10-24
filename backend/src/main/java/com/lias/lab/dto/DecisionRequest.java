package com.lias.lab.dto;

import com.lias.lab.entity.ApplicationStatus;
import com.lias.lab.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DecisionRequest {
    @NotNull
    private ApplicationStatus decision; // ACCEPTED ou REJECTED
    private Role assignedRole;
    private Long assignedTeamId;

    public void setDecision(Object val) {
        if (val == null) return;
        String s = val.toString().toUpperCase().trim();
        if (s.startsWith("ACCEPT")) {
            this.decision = ApplicationStatus.ACCEPTED;
        } else if (s.startsWith("REJECT")) {
            this.decision = ApplicationStatus.REJECTED;
        } else {
            this.decision = ApplicationStatus.valueOf(s);
        }
    }

    public void setAssignedRole(Object val) {
        if (val == null) return;
        String s = val.toString().toUpperCase().trim();
        if (s.equals("PHD_STUDENT") || s.equals("ASSOCIATED")) {
            this.assignedRole = Role.MEMBER;
        } else {
            try {
                this.assignedRole = Role.valueOf(s);
            } catch (Exception e) {
                this.assignedRole = Role.MEMBER;
            }
        }
    }

    public void setAssignedTeamId(Object val) {
        if (val == null) {
            this.assignedTeamId = null;
        } else if (val instanceof Number n) {
            this.assignedTeamId = n.longValue();
        } else {
            String s = val.toString().replaceAll("[^0-9]", "");
            this.assignedTeamId = s.isEmpty() ? 1L : Long.parseLong(s);
        }
    }
}
