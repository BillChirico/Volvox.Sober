# Volvox.Sober Project Overview

## Purpose
Volvox.Sober is a cross-platform mobile application (iOS and Android) for sobriety support and recovery. The platform enables authentic peer accountability through curated sponsor/sponsee matching, connecting individuals in recovery with experienced mentors.

## Core Features
- **Sponsor/Sponsee Matching**: SQL-based intelligent matching algorithm connecting sponsors with sponsees
- **12-Step AA Worksheets**: Structured step work with sponsor editing capabilities
- **Hybrid Communication**: In-app messaging + optional external contact
- **Sobriety Tracking**: Full mutual visibility between sponsors and sponsees
- **Real-time Messaging**: Supabase Realtime subscriptions for instant communication
- **Scheduled Notifications**: Edge Functions triggered by pg_cron

## Technical Stack

### Frontend
- **Framework**: React Native 0.73+
- **Language**: TypeScript 5.x (strict mode enabled)
- **Navigation**: React Navigation (stack + bottom tabs)
- **State Management**: Zustand + React Query
- **Form Handling**: React Hook Form + Zod validation
- **UI**: Custom design system with dark/light mode theming

### Backend
- **Platform**: Supabase
- **Database**: PostgreSQL 15+
- **Authentication**: Supabase Auth (GoTrue)
- **Real-time**: Supabase Realtime subscriptions
- **Functions**: Supabase Edge Functions (Deno runtime)
- **Storage**: Row Level Security (RLS) for data privacy

### Testing
- **Unit/Integration**: Jest + React Native Testing Library
- **E2E**: Playwright
- **Contract Tests**: API schema validation
- **Coverage Target**: 80% minimum for business logic

## Project Status
- **Current Phase**: Phase 0 - Setup & Infrastructure
- **Active Work Package**: WP01 - Project Setup
- **Branch**: 001-volvox-sober-recovery

The project is in initial setup phase. Core infrastructure needs to be established before feature development begins.