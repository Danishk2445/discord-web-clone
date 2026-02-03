package com.discord.discord_clone.controller;

import com.discord.discord_clone.entity.Channel;
import com.discord.discord_clone.entity.Message;
import com.discord.discord_clone.entity.User;
import com.discord.discord_clone.repository.ChannelRepository;
import com.discord.discord_clone.repository.MessageRepository;
import com.discord.discord_clone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private ChannelRepository channelRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody Map<String, Object> request) {
        Message message = new Message();
        message.setContent((String) request.get("content"));
        message.setSenderId(Long.valueOf(request.get("senderId").toString()));
        
        Long channelId = Long.valueOf(request.get("channelId").toString());
        Channel channel = channelRepository.findById(channelId).orElseThrow();
        message.setChannel(channel);
        
        return ResponseEntity.ok(messageRepository.save(message));
    }
    
    @GetMapping("/channel/{channelId}")
    public ResponseEntity<List<Message>> getChannelMessages(@PathVariable Long channelId) {
        List<Message> messages = messageRepository.findByChannelIdOrderByTimestampAsc(channelId);
        
        // Add sender username to each message
        messages.forEach(msg -> {
            userRepository.findById(msg.getSenderId()).ifPresent(user -> 
                msg.setSenderUsername(user.getUsername())
            );
        });
        
        return ResponseEntity.ok(messages);
    }
}
