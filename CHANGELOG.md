# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.0.2] - 2026-05-15
- **Updated Formulas:** Fixed issues with exercises, updated formulas for circle and butterflies

## [1.0.1] - 2026-04-08

### Fixed
- **Push Notifications:** Resolved critical issue where native notifications were failing to show due to non-existent icon path entries.

### Changed
- **Asset Management:** Standardized all system notifications to use the core application assets (`/icon/128.png`).

### Security
- **Permission Mapping:** Removed redundant `scripting` and `activeTab` permissions to enhance user privacy and adhere to the principle of least privilege after the transition to the Side Panel architecture.

## [1.0.0] - 2026-04-05

### Added
- **Core Architecture Engine:** Complete migration to React 19 and the next-generation WXT extension framework.
- **Side Panel Interface:** Full side-panel integration designed as the primary UI, discarding the legacy browser popup approach.
- **Dynamic Exercise System:** Implemented various motion trajectories using Framer Motion (horizontal, vertical, diagonal, circle, zigzag, butterfly, globe, and square options).
- **Automated Reminders:** Robust background alarm mechanism to periodically invoke eye health check-ins.
- **Notification Preferences:** Users can now toggle between Extension Badges, native Push Notifications, or in-app Banner Alerts for exercise reminders.
- **Internationalization (i18n):** Extensible multi-language structure for future localization.
- **Styling:** Migrated entirely to Tailwind CSS v4, achieving an independent utility-first design without heavy styling overhead.

### Changed
- **Performance:** Re-engineered animation behavior to ensure high-speed, continuous 60fps trajectory updates reaching all edges of the screen correctly.
- **UX Improvements:** Simplified the navigation flow focusing strictly on configuring and launching exercises from the Side Panel.

### Fixed
- Addressed strict TypeScript evaluation errors occurring within Framer Motion transition easing configuration.
- Resolved build-time bundle errors related to WXT packaging and legacy script bindings.

### Security
- Removed the `unlimitedStorage` permission to ensure compliance with modern extension guidelines and prioritize data minimalism.
