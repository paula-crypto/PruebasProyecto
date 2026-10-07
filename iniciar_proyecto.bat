@echo off
chcp 65001 > nul
title Sistema de Paz y Salvo Contractual SENA

echo ======================================================================
echo       SISTEMA DE PAZ Y SALVO CONTRACTUAL SENA (GCCON-F-088)
echo ======================================================================
echo.
echo Iniciando el Backend en el puerto 3000...
start "Backend - Paz y Salvo (Puerto 3000)" cmd /k "cd backend && npm run dev"

echo Iniciando el Frontend en el puerto 9000...
start "Frontend - Paz y Salvo (Puerto 9000)" cmd /k "cd frontend && npm run dev"

echo.
echo Esperando que inicien los servidores...
timeout /t 5 > nul

echo Abriendo el navegador en http://localhost:9000 ...
start http://localhost:9000

echo.
echo ======================================================================
echo  Servidores iniciados exitosamente.
echo  - Frontend: http://localhost:9000
echo  - Backend API: http://localhost:3000/api
echo  - Documentacion Swagger: http://localhost:3000/api-docs
echo.
echo  Credenciales de Administrador por defecto:
echo  Correo: admin@gccon.com
echo  Clave:  Admin1234!
echo ======================================================================
echo.
pause
