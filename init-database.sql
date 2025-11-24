-- ====================================
-- MultiDB Academy - Database Setup
-- ====================================

-- Create base database
CREATE DATABASE IF NOT EXISTS multidb_academy;
USE multidb_academy;

-- Eliminar tablas si existen (orden inverso por FK)
DROP TABLE IF EXISTS Logs;
DROP TABLE IF EXISTS Emails;
DROP TABLE IF EXISTS CredentialsDb;
DROP TABLE IF EXISTS InstanceDBs;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Roles;

-- ====================================
-- Table: Roles
-- ====================================
CREATE TABLE Roles (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar roles predeterminados
INSERT INTO Roles (Id, Name) VALUES 
(1, 'Admin'),
(2, 'Student');

-- ====================================
-- Tabla: Users
-- ====================================
CREATE TABLE Users (
    Id CHAR(36) PRIMARY KEY,
    UserName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PassHash VARCHAR(255) NOT NULL,
    RoleId INT NOT NULL DEFAULT 1,
    RefreshToken VARCHAR(500),
    RefreshTokenExpire DATETIME,
    CreateAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdateAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (Email),
    INDEX idx_roleid (RoleId),
    CONSTRAINT fk_user_role FOREIGN KEY (RoleId) REFERENCES Roles(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================
-- Verification
-- ====================================
SHOW TABLES;
SELECT 'Database initialized successfully!' AS Status;
