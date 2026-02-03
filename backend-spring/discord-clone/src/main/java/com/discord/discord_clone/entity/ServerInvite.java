package com.discord.discord_clone.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "server_invites")
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
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getInviteCode() { return inviteCode; }
    public void setInviteCode(String inviteCode) { this.inviteCode = inviteCode; }
    
    public Long getServerId() { return serverId; }
    public void setServerId(Long serverId) { this.serverId = serverId; }
    
    public Long getCreatorId() { return creatorId; }
    public void setCreatorId(Long creatorId) { this.creatorId = creatorId; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    
    public Integer getMaxUses() { return maxUses; }
    public void setMaxUses(Integer maxUses) { this.maxUses = maxUses; }
    
    public Integer getCurrentUses() { return currentUses; }
    public void setCurrentUses(Integer currentUses) { this.currentUses = currentUses; }
}
