package com.discord.discord_clone.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO sent by the client when posting a message to a channel via WebSocket.
 * Destination: /app/message.send
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    private Long channelId;
    private Long senderId;
    private String content;
}
