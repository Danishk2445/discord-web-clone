package com.discord.discord_clone.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO sent by the client when sending a direct message via WebSocket.
 * Destination: /app/dm.send
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DMRequest {
    private Long senderId;
    private String receiverUsername; // used to route to /user/{receiverUsername}/queue/dm
    private String content;
}
