package com.discord.discord_clone.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "servers")
public class Server {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private Long ownerId;

    @JsonIgnore
    @ManyToMany(mappedBy = "servers")
    private Set<User> members = new HashSet<>();
    
    @JsonIgnore
    @OneToMany(mappedBy = "server", cascade = CascadeType.ALL)
    private List<Channel> channels = new ArrayList<>();
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    
    public Set<User> getMembers() { return members; }
    public void setMembers(Set<User> members) { this.members = members; }
    
    public List<Channel> getChannels() { return channels; }
    public void setChannels(List<Channel> channels) { this.channels = channels; }
}
