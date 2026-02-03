package com.discord.discord_clone.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "channels")
public class Channel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "server_id", nullable = false)
    private Server server;
    
    @JsonIgnore
    @OneToMany(mappedBy = "channel", cascade = CascadeType.ALL)
    private List<Message> messages = new ArrayList<>();
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Server getServer() { return server; }
    public void setServer(Server server) { this.server = server; }
    
    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }
}
