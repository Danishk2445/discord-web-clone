-- Create Database
CREATE DATABASE IF NOT EXISTS discord_clone;
USE discord_clone;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Servers Table
CREATE TABLE IF NOT EXISTS servers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Channels Table
CREATE TABLE IF NOT EXISTS channels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    server_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id BIGINT NOT NULL,
    channel_id BIGINT NOT NULL,
    timestamp DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    INDEX idx_channel_timestamp (channel_id, timestamp)
);

-- Server Members Join Table (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS server_members (
    server_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (server_id, user_id),
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_channels_server ON channels(server_id);
CREATE INDEX idx_server_members_user ON server_members(user_id);

-- Sample Data (Optional - for testing)
INSERT INTO users (username, email, password) VALUES 
('alice', 'alice@example.com', '$2a$10$xN8T7vJhDZYXLz4YnqGqSeFq7Oi2zJlU4QYVHzNqKZ.YFmLNg0.Fy'),
('bob', 'bob@example.com', '$2a$10$xN8T7vJhDZYXLz4YnqGqSeFq7Oi2zJlU4QYVHzNqKZ.YFmLNg0.Fy');

INSERT INTO servers (name, owner_id) VALUES 
('General Server', 1),
('Gaming Hub', 1);

INSERT INTO channels (name, server_id) VALUES 
('general', 1),
('random', 1),
('gaming', 2),
('chat', 2);

INSERT INTO server_members (server_id, user_id) VALUES 
(1, 1),
(1, 2),
(2, 1);

INSERT INTO messages (content, sender_id, channel_id, timestamp) VALUES 
('Welcome to the server!', 1, 1, NOW()),
('Thanks for having me!', 2, 1, NOW()),
('Anyone up for gaming?', 1, 3, NOW());
