package com.discord.discord_clone.repository;

import com.discord.discord_clone.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    @Query("SELECT f FROM Friendship f WHERE (f.senderId = ?1 OR f.receiverId = ?1) AND f.status = 'ACCEPTED'")
    List<Friendship> findAcceptedFriendsByUserId(Long userId);
    
    @Query("SELECT f FROM Friendship f WHERE f.receiverId = ?1 AND f.status = 'PENDING'")
    List<Friendship> findPendingRequestsByUserId(Long userId);
    
    @Query("SELECT f FROM Friendship f WHERE ((f.senderId = ?1 AND f.receiverId = ?2) OR (f.senderId = ?2 AND f.receiverId = ?1))")
    Optional<Friendship> findFriendshipBetweenUsers(Long userId1, Long userId2);
}
