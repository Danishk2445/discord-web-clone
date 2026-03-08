package com.discord.discord_clone.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "server_invites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServerInvite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String inviteCode;

    @Column(nullable = false)
    private Long serverId;

    @Column(nullable = false)
    private Long creatorId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Integer maxUses;

    @Column(nullable = false)
    private Integer currentUses = 0;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (expiresAt == null) {
            expiresAt = createdAt.plusDays(7); // Default 7 days expiry
        }
    }
}
