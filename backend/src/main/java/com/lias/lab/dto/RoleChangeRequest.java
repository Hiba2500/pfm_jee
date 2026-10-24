package com.lias.lab.dto;

import com.lias.lab.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleChangeRequest {
    @NotNull private Role role;
    private String reason;
}
