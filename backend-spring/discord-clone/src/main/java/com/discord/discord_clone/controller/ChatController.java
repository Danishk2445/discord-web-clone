package com.discord.discord_clone.controller;

import com.discord.discord_clone.dto.ChatMessageRequest;
import com.discord.discord_clone.dto.DMRequest;
import com.discord.discord_clone.entity.Channel;
import com.discord.discord_clone.entity.DirectMessage;
import com.discord.discord_clone.entity.Message;
import com.discord.discord_clone.entity.User;
import com.discord.discord_clone.repository.ChannelRepository;
import com.discord.discord_clone.repository.DirectMessageRepository;
import com.discord.discord_clone.repository.MessageRepository;
import com.discord.discord_clone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private DirectMessageRepository directMessageRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Handles channel messages sent to /app/message.send
     * Saves the message to the DB and broadcasts it to /topic/channel.{channelId}
     * so all subscribers of that channel receive it in real time.
     */
    @MessageMapping("/message.send")
    public void sendChannelMessage(ChatMessageRequest request) {
        Channel channel = channelRepository.findById(request.getChannelId())
                .orElseThrow(() -> new RuntimeException("Channel not found: " + request.getChannelId()));

        Message message = new Message();
        message.setContent(request.getContent());
        message.setSenderId(request.getSenderId());
        message.setChannel(channel);

        Message saved = messageRepository.save(message);

        // Enrich with sender username before broadcasting
        userRepository.findById(saved.getSenderId())
                .ifPresent(user -> saved.setSenderUsername(user.getUsername()));

        // Broadcast to all subscribers of this channel
        messagingTemplate.convertAndSend("/topic/channel." + channel.getId(), saved);
    }

    /**
     * Handles direct messages sent to /app/dm.send
     * Saves the DM to the DB and routes it to the specific receiver's queue.
     * The receiver must be subscribed to /user/queue/dm
     */
    @MessageMapping("/dm.send")
    public void sendDirectMessage(DMRequest request) {
        User receiver = userRepository.findByUsername(request.getReceiverUsername())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getReceiverUsername()));

        DirectMessage dm = new DirectMessage();
        dm.setContent(request.getContent());
        dm.setSenderId(request.getSenderId());
        dm.setReceiverId(receiver.getId());
        dm.setIsRead(false);

        DirectMessage saved = directMessageRepository.save(dm);

        // Enrich with sender username before sending
        userRepository.findById(saved.getSenderId())
                .ifPresent(user -> saved.setSenderUsername(user.getUsername()));

        // Send to the specific receiver only
        messagingTemplate.convertAndSendToUser(
                request.getReceiverUsername(),
                "/queue/dm",
                saved);
    }
}
