package com.discord.discord_clone.controller;

import com.discord.discord_clone.entity.Server;
import com.discord.discord_clone.entity.User;
import com.discord.discord_clone.repository.ServerRepository;
import com.discord.discord_clone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/servers")
@CrossOrigin(origins = "*")
public class ServerController {
    
    @Autowired
    private ServerRepository serverRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<Server> createServer(@RequestBody Server server) {
        Server savedServer = serverRepository.save(server);
        
        // Add owner as member
        User owner = userRepository.findById(server.getOwnerId()).orElseThrow();
        owner.getServers().add(savedServer);
        userRepository.save(owner);
        
        return ResponseEntity.ok(savedServer);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Server>> getUserServers(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return ResponseEntity.ok(new ArrayList<>(user.getServers()));
    }
    
    @GetMapping("/{serverId}/members")
    public ResponseEntity<List<Map<String, Object>>> getServerMembers(@PathVariable Long serverId) {
        Server server = serverRepository.findById(serverId).orElseThrow();
        
        List<Map<String, Object>> members = new ArrayList<>();
        for (User member : server.getMembers()) {
            Map<String, Object> memberData = new HashMap<>();
            memberData.put("id", member.getId());
            memberData.put("username", member.getUsername());
            memberData.put("email", member.getEmail());
            members.add(memberData);
        }
        
        return ResponseEntity.ok(members);
    }
}