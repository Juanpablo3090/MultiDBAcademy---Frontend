# 🚀 MultiDB Academy - Guía de Instalación

cat > ~/Escritorio/Desarrollo-typescript/api-front-c/README.md << 'EOF'
# MultiDB Academy

## Requisitos Previos
- Node.js v18 o superior
- .NET 8 SDK
- MySQL/MariaDB

## Instalación

### 1. Backend (.NET)
```bash
cd MultiDBAcademy-main
dotnet restore
dotnet build
dotnet run --project MultiDBAcademy.Api

## 📋 Requisitos Previos

### Backend (.NET)
- .NET 8 SDK
- MySQL/MariaDB 11.x

### Frontend (Next.js)
- Node.js 18+ y npm

---

## 🔧 Instalación Paso a Paso

### 1️⃣ Configurar MySQL

```bash
# Iniciar MySQL/MariaDB
sudo systemctl start mysql  # o mariadb

# Crear usuario y base de datos
sudo mysql << 'SQL'
CREATE DATABASE multidb_academy;
CREATE USER 'dbuser'@'localhost' IDENTIFIED BY 'dbpass123';
GRANT ALL PRIVILEGES ON multidb_academy.* TO 'dbuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
SQL