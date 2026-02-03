package com.discord.discord_clone.repository;

import com.discord.discord_clone.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChannelIdOrderByTimestampAsc(Long channelId);
}
