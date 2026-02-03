package com.discord.discord_clone.controller;

import com.discord.discord_clone.entity.DirectMessage;
import com.discord.discord_clone.repository.DirectMessageRepository;
import com.discord.discord_clone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dm")
@CrossOrigin(origins = "*")
public class DirectMessageController {
    
    @Autowired
    private DirectMessageRepository dmRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<DirectMessage> sendDirectMessage(@RequestBody Map<String, Object> request) {
        DirectMessage dm = new DirectMessage();
        dm.setContent(request.get("content").toString());
        dm.setSenderId(Long.valueOf(request.get("senderId").toString()));
        dm.setReceiverId(Long.valueOf(request.get("receiverId").toString()));
        
        return ResponseEntity.ok(dmRepository.save(dm));
    }
    
    @GetMapping("/conversation")
    public ResponseEntity<List<DirectMessage>> getConversation(
            @RequestParam Long userId1,
            @RequestParam Long userId2) {
        List<DirectMessage> messages = dmRepository.findConversationBetweenUsers(userId1, userId2);
        
        // Add sender usernames
        messages.forEach(msg -> {
            userRepository.findById(msg.getSenderId()).ifPresent(user -> 
                msg.setSenderUsername(user.getUsername())
            );
        });
        
        // Mark messages as read for the requesting user
        messages.stream()
            .filter(msg -> msg.getReceiverId().equals(userId1) && !msg.getIsRead())
            .forEach(msg -> {
                msg.setIsRead(true);
                dmRepository.save(msg);
            });
        
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/unread/{userId}")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(dmRepository.countUnreadMessagesByUserId(userId));
    }
}
