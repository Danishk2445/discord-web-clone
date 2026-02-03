package com.discord.discord_clone.controller;

import com.discord.discord_clone.entity.Channel;
import com.discord.discord_clone.entity.Server;
import com.discord.discord_clone.repository.ChannelRepository;
import com.discord.discord_clone.repository.ServerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/channels")
@CrossOrigin(origins = "*")
public class ChannelController {
    
    @Autowired
    private ChannelRepository channelRepository;
    
    @Autowired
    private ServerRepository serverRepository;
    
    @PostMapping
    public ResponseEntity<Channel> createChannel(@RequestBody Map<String, Object> request) {
        Channel channel = new Channel();
        channel.setName((String) request.get("name"));
        
        Long serverId = Long.valueOf(request.get("serverId").toString());
        Server server = serverRepository.findById(serverId).orElseThrow();
        channel.setServer(server);
        
        return ResponseEntity.ok(channelRepository.save(channel));
    }
    
    @GetMapping("/server/{serverId}")
    public ResponseEntity<List<Channel>> getServerChannels(@PathVariable Long serverId) {
        return ResponseEntity.ok(channelRepository.findByServerId(serverId));
    }
}
