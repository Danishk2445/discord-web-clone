package com.discord.discord_clone.repository;

import com.discord.discord_clone.entity.ServerInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServerInviteRepository extends JpaRepository<ServerInvite, Long> {
    Optional<ServerInvite> findByInviteCode(String inviteCode);
    List<ServerInvite> findByServerId(Long serverId);
}
