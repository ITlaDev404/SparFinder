CREATE DATABASE IF NOT EXISTS sparfinder;
USE sparfinder;

CREATE TABLE IF NOT EXISTS User (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    Height INT,
    Weight INT,
    Level VARCHAR(50),
    Country VARCHAR(100),
    Region VARCHAR(100),
    IsAdmin VARCHAR(10) DEFAULT 'false',
    INDEX idx_email (Email)
);

CREATE TABLE IF NOT EXISTS Sport (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT
);

CREATE TABLE IF NOT EXISTS UserSport (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    SportID INT NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User(ID) ON DELETE CASCADE,
    FOREIGN KEY (SportID) REFERENCES Sport(ID) ON DELETE CASCADE,
    UNIQUE KEY unique_user_sport (UserID, SportID)
);

CREATE TABLE IF NOT EXISTS SparringRequest (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SenderID INT NOT NULL,
    ReceiverID INT NOT NULL,
    SportID INT NOT NULL,
    Message VARCHAR(500),
    Status VARCHAR(20) NOT NULL DEFAULT 'pending',
    CreatedAt VARCHAR(50) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SenderID) REFERENCES User(ID) ON DELETE CASCADE,
    FOREIGN KEY (ReceiverID) REFERENCES User(ID) ON DELETE CASCADE,
    FOREIGN KEY (SportID) REFERENCES Sport(ID)
);

CREATE TABLE IF NOT EXISTS Message (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    SenderID INT NOT NULL,
    ReceiverID INT NOT NULL,
    Content TEXT NOT NULL,
    CreatedAt VARCHAR(50),
    FOREIGN KEY (SenderID) REFERENCES User(ID) ON DELETE CASCADE,
    FOREIGN KEY (ReceiverID) REFERENCES User(ID) ON DELETE CASCADE
);

-- Insertion des sports de combat
INSERT INTO Sport (Name, Description) VALUES
('MMA', 'Mixed Martial Arts - Arts martiaux mixtes'),
('Boxe', 'Sport de combat aux poings'),
('Kickboxing', 'Combat avec poings et pieds'),
('Lutte', 'Sport de combat au sol et debout'),
('Grappling', 'Combat au sol sans coups'),
('Sambo', 'Combat militaire russe'),
('Judo', 'Art martial japonais'),
('Jujitsu', 'Art martial japonais ancien'),
('Krav Maga', 'Système de défense israelien'),
('Taekwondo', 'Art martial coréen');

-- Mettre un utilisateur en admin (remplacer email par l'email souhaité)
-- UPDATE User SET IsAdmin = 'true' WHERE Email = 'admin@example.com';