# 📅 Calendar & Reminders Productivity App

A modern iOS mobile application that integrates with native Apple Calendar and Apple Reminders for managing events and
tasks.

## 🎯 Description

This productivity app provides a unified interface for viewing calendar events and managing reminders. It synchronizes
with Apple’s native system apps (Calendar and Reminders), ensuring seamless integration within the iOS ecosystem.

### 🌟 Key Features

* **📅 Apple Calendar Sync** – Automatic synchronization of events with the iOS system calendar
* **✅ Apple Reminders Integration** – View and manage tasks from the native Reminders app
* **🔄 Auto Updates** – Smart periodic data sync (every 30 seconds)
* **🕐 Smart Time Navigation**:

  * Automatically switches to the next day at midnight
  * Automatically updates week and month views
  * Auto-resets to the current day after 60 seconds of inactivity
* **👻 Hide Past Events** – Automatically dims and marks completed events
* **📱 Adaptive Views**:

  * Monthly view (desktop)
  * Weekly view (tablet)
  * Daily view (mobile)
* **🎨 Modern UI/UX** – Beautiful interface with dark mode support
* **⚡ High Performance** – Optimized re-renders and flicker-free updates

## 🛠 Tech Stack

### Frontend Framework

* **[SolidJS](https://www.solidjs.com/) 1.8.7** – High-performance reactive JavaScript framework
* **[TypeScript](https://www.typescriptlang.org/) 5.3.3** – Static typing for safer, more reliable code

### Mobile Platform

* **[Capacitor](https://capacitorjs.com/) 5.5.1** – Cross-platform framework for native apps

  * `@capacitor/ios` – iOS platform
  * `@capacitor/android` – Android platform
  * `@capacitor/app` – App lifecycle management
  * `@capacitor/core` – Core Capacitor functionality

### UI & Styling

* **[TailwindCSS](https://tailwindcss.com/) 3.4.0** – Utility-first CSS framework
* **[Kobalte](https://kobalte.dev/) 0.13.11** – Accessible UI components for SolidJS
* **[tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) 1.0.7** – Animations for Tailwind
* **[class-variance-authority](https://cva.style/) 0.7.1** – Style variant management
* **[tailwind-merge](https://github.com/dcastil/tailwind-merge) 3.3.1** – Merge Tailwind class utilities
* **[clsx](https://github.com/lukeed/clsx) 2.1.1** – Conditional class utility

### Internationalization

* **[@solid-primitives/i18n](https://github.com/solidjs-community/solid-primitives/tree/main/packages/i18n) 2.1.1** –
  Internationalization library for SolidJS

### Build Tools & Development

* **[Vite](https://vitejs.dev/) 5.0.8** – Fast bundler and dev server
* **[vite-plugin-solid](https://github.com/solidjs/vite-plugin-solid) 2.8.2** – SolidJS plugin for Vite
* **[ESLint](https://eslint.org/) 9.39.1** – JavaScript/TypeScript linter
* **[Prettier](https://prettier.io/) 3.6.2** – Code formatter
* **[PostCSS](https://postcss.org/) 8.4.32** – CSS transformation tool
* **[Autoprefixer](https://github.com/postcss/autoprefixer) 10.4.16** – Automatic vendor prefixer

### Native Plugins (Custom)

* **AppleCalendarPlugin** – Custom Swift plugin for EventKit (Apple Calendar) integration
* **AppleRemindersPlugin** – Custom Swift plugin for EventKit (Apple Reminders) integration

## 🏗 Architecture

### Store Management (Solid Stores)

The app uses reactive data stores built with SolidJS:

* **`calendar.store.ts`** – Manages calendar state, events, and timers
* **`reminders.store.ts`** – Manages reminders and tasks

### Native Integration

#### Apple Calendar Plugin

* Uses iOS `EventKit` framework
* Requests calendar access permissions
* Retrieves events for a specified period
* Supports all standard event fields (title, date, location, description)

#### Apple Reminders Plugin

* Uses iOS `EventKit` framework for Reminders
* Retrieves reminder lists and tasks
* Supports completion status and priorities
* Displays reminders by category

### Key Features

#### 🔄 Automatic Synchronization
