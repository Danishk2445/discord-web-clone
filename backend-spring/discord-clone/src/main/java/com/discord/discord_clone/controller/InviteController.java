package com.discord.discord_clone.controller;

import com.discord.discord_clone.entity.Server;
import com.discord.discord_clone.entity.ServerInvite;
import com.discord.discord_clone.entity.User;
import com.discord.discord_clone.repository.ServerInviteRepository;
import com.discord.discord_clone.repository.ServerRepository;
import com.discord.discord_clone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/invites")
@CrossOrigin(origins = "*")
public class InviteController {
    
    @Autowired
    private ServerInviteRepository inviteRepository;
    
    @Autowired
    private ServerRepository serverRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<?> createInvite(@RequestBody Map<String, Object> request) {
        Long serverId = Long.valueOf(request.get("serverId").toString());
        Long creatorId = Long.valueOf(request.get("creatorId").toString());
        Integer maxUses = request.containsKey("maxUses") ? 
            Integer.valueOf(request.get("maxUses").toString()) : 100;
        
        ServerInvite invite = new ServerInvite();
        invite.setServerId(serverId);
        invite.setCreatorId(creatorId);
        invite.setMaxUses(maxUses);
        invite.setInviteCode(UUID.randomUUID().toString().substring(0, 8));
        
        return ResponseEntity.ok(inviteRepository.save(invite));
    }
    
    @GetMapping("/server/{serverId}")
    public ResponseEntity<List<ServerInvite>> getServerInvites(@PathVariable Long serverId) {
        return ResponseEntity.ok(inviteRepository.findByServerId(serverId));
    }
    
    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<?> joinServerByInvite(
            @PathVariable String inviteCode,
            @RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        
        ServerInvite invite = inviteRepository.findByInviteCode(inviteCode)
            .orElseThrow(() -> new RuntimeException("Invalid invite code"));
        
        // Check if invite is valid
        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invite expired"));
        }
        
        if (invite.getCurrentUses() >= invite.getMaxUses()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invite has reached max uses"));
        }
        
        // Add user to server
        Server server = serverRepository.findById(invite.getServerId()).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        
        if (user.getServers().contains(server)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Already in server"));
        }
        
        user.getServers().add(server);
        userRepository.save(user);
        
        // Increment invite uses
        invite.setCurrentUses(invite.getCurrentUses() + 1);
        inviteRepository.save(invite);
        
        return ResponseEntity.ok(Map.of("message", "Successfully joined server", "server", server));
    }
}
