# APB — Agent Project Bootstrapper

Chrome/Edge Manifest V3 extension for orchestrating ChatGPT project setup and supervised continuous runs.

## Current scope
- Project bootstrap prompt with no-download policy.
- Project/repository naming convention.
- Research + work prompt injection.
- Randomized auto-continue phrases.
- Completion detection through the ChatGPT UI.
- **ALERTA** / **CONTINÚO** terminal markers.
- Commander process concurrency verified on the target PC.

## Naming
Project ID: `PRJ-YYYYMMDD-HHMM-XXXX`
GitHub: `prj-YYYYMMDD-HHMM-XXXX-project-name`
Local: `PRJ-YYYYMMDD-HHMM-XXXX__project-name`

## Architecture
Side Panel → Content Script → ChatGPT UI.
Service Worker stores project/cycle state.
Desktop Commander remains the execution layer for PC/Git/GitHub CLI operations.

## Safety
The extension stops on **ALERTA**, an unknown terminal state, or a response timeout.

## Status
Prototype v0.1.0.