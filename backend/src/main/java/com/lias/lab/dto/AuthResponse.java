package com.lias.lab.dto;

import com.lias.lab.entity.MemberStatus;
import com.lias.lab.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private MemberStatus status;
    private String title;
    private String teamName;
}
