package com.discord.discord_clone.repository;

import com.discord.discord_clone.entity.DirectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {
    @Query("SELECT dm FROM DirectMessage dm WHERE (dm.senderId = ?1 AND dm.receiverId = ?2) OR (dm.senderId = ?2 AND dm.receiverId = ?1) ORDER BY dm.timestamp ASC")
    List<DirectMessage> findConversationBetweenUsers(Long userId1, Long userId2);
    
    @Query("SELECT COUNT(dm) FROM DirectMessage dm WHERE dm.receiverId = ?1 AND dm.isRead = false")
    Long countUnreadMessagesByUserId(Long userId);
}
