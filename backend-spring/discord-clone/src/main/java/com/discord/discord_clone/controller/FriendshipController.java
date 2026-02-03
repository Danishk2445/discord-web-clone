package com.discord.discord_clone.controller;

import com.discord.discord_clone.entity.Friendship;
import com.discord.discord_clone.entity.User;
import com.discord.discord_clone.repository.FriendshipRepository;
import com.discord.discord_clone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
@CrossOrigin(origins = "*")
public class FriendshipController {
    
    @Autowired
    private FriendshipRepository friendshipRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/request")
    public ResponseEntity<?> sendFriendRequest(@RequestBody Map<String, Object> request) {
        Long senderId = Long.valueOf(request.get("senderId").toString());
        String receiverUsername = request.get("receiverUsername").toString();
        
        User receiver = userRepository.findByUsername(receiverUsername)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (senderId.equals(receiver.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot add yourself"));
        }
        
        // Check if friendship already exists
        if (friendshipRepository.findFriendshipBetweenUsers(senderId, receiver.getId()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Friendship already exists"));
        }
        
        Friendship friendship = new Friendship();
        friendship.setSenderId(senderId);
        friendship.setReceiverId(receiver.getId());
        friendship.setStatus("PENDING");
        
        return ResponseEntity.ok(friendshipRepository.save(friendship));
    }
    
    @PostMapping("/accept/{friendshipId}")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable Long friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId).orElseThrow();
        friendship.setStatus("ACCEPTED");
        friendship.setAcceptedAt(LocalDateTime.now());
        return ResponseEntity.ok(friendshipRepository.save(friendship));
    }
    
    @DeleteMapping("/{friendshipId}")
    public ResponseEntity<?> removeFriend(@PathVariable Long friendshipId) {
        friendshipRepository.deleteById(friendshipId);
        return ResponseEntity.ok(Map.of("message", "Friend removed"));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Friendship>> getUserFriends(@PathVariable Long userId) {
        List<Friendship> friends = friendshipRepository.findAcceptedFriendsByUserId(userId);
        
        // Add usernames to each friendship
        friends.forEach(f -> {
            userRepository.findById(f.getSenderId()).ifPresent(u -> f.setSenderUsername(u.getUsername()));
            userRepository.findById(f.getReceiverId()).ifPresent(u -> f.setReceiverUsername(u.getUsername()));
        });
        
        return ResponseEntity.ok(friends);
    }
    
    @GetMapping("/requests/{userId}")
    public ResponseEntity<List<Friendship>> getPendingRequests(@PathVariable Long userId) {
        List<Friendship> requests = friendshipRepository.findPendingRequestsByUserId(userId);
        
        // Add usernames
        requests.forEach(f -> {
            userRepository.findById(f.getSenderId()).ifPresent(u -> f.setSenderUsername(u.getUsername()));
        });
        
        return ResponseEntity.ok(requests);
    }
}
