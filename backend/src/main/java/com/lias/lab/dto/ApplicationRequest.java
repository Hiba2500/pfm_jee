package com.lias.lab.dto;

import com.lias.lab.entity.MemberStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Soumission en ligne d'une demande d'adhésion (section 6). */
@Data
public class ApplicationRequest {
    @NotBlank private String candidateName;
    @NotBlank @Email private String email;
    private String degree;
    private String cvSummary;
    @NotBlank private String motivation;
    private MemberStatus targetStatus;
    private Long targetTeamId;

    public void setTargetTeamId(Object val) {
        if (val == null) {
            this.targetTeamId = null;
        } else if (val instanceof Number n) {
            this.targetTeamId = n.longValue();
        } else {
            String s = val.toString().replaceAll("[^0-9]", "");
            this.targetTeamId = s.isBlank() ? null : Long.parseLong(s);
        }
    }
}
