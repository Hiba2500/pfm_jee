package com.lias.lab.dto;

import com.lias.lab.entity.MandateType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MandateRequest {
    private Long userId;
    private String personName;
    private MandateType type;
    private String role;
    private Long teamId;
    private String teamName;
    private LocalDate startDate;
    private LocalDate endDate;
}
