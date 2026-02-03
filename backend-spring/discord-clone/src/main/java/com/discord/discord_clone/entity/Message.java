package com.discord.discord_clone.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 2000)
    private String content;
    
    @Column(nullable = false)
    private Long senderId;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;
    
    @Transient
    private String senderUsername;
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public Channel getChannel() { return channel; }
    public void setChannel(Channel channel) { this.channel = channel; }
    
    public String getSenderUsername() { return senderUsername; }
    public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }
    
    @PrePersist
    public void prePersist() {
        timestamp = LocalDateTime.now();
    }
}
