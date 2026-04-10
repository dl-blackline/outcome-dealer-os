-- Migration 0001: Enable PostgreSQL Extensions
-- Purpose: Enable required PostgreSQL extensions for UUID generation and cryptographic functions
-- Dependencies: None (first migration)

create extension if not exists pgcrypto;
