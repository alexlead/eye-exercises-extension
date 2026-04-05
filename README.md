# 👀 Eye Exercises Tool

A lightweight, visually engaging Chrome extension designed to help reduce eye strain during prolonged screen time by offering guided eye exercises and recurring reminders.

![Manifest V3](https://img.shields.io/badge/Manifest_V3-Ready-success)
![React](https://img.shields.io/badge/React-19.2-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-blueviolet)
![WXT](https://img.shields.io/badge/Built_with-WXT-orange)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-Included-ff69b4)

---

## 📌 Features

- **Dynamic Eye Exercises:** Follow an animated visual guide (the "ball") moving in continuous, customizable trajectories such as horizontal, vertical, diagonal, circle, zigzag, butterfly, and globe patterns.
- **Persistent Reminders:** Stay on top of your eye health with an automated, background alarm system. Opt for notification methods like extension badges, standard push notifications, or banner alerts.
- **Side Panel Integration:** Directly access the application and perform exercises right inside the browser's native Side Panel without needing to open a new tab.
- **Smooth Animations:** Built with Framer Motion, providing buttery-smooth 60fps animations that accurately guide eye movements at dynamic speeds across the entire container.
- **Internationalization (i18n):** Multi-language UI structure, prepared to adapt to various locales.

## 🛠️ Technology Stack

- **Extension Framework:** [WXT](https://wxt.dev/) — The Next-Gen browser extension framework
- **UI Library:** React.js (v19) + TypeScript
- **Styling:** Tailwind CSS v4 alongside `clsx` and `tailwind-merge`
- **Animations:** Framer Motion
- **Storage:** `idb-keyval` (IndexedDB Wrapper)
- **Icons:** Lucide React

## 🚀 Installation & Build

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Local Development

1. **Clone the repository:**
   ```bash
   git clone git@github.com:alexlead/eye-exercises-extension.git
   cd eye-exercises-extension
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   > This command will automatically build the React application, launch a dedicated browser profile, and install the unpacked extension with strict Hot-Module Replacement (HMR).

### Building for Production

To create a production-ready build for the Chrome Web Store:

1. **Compile and build:**
   ```bash
   npm run build
   ```

2. **Package the extension:**
   ```bash
   npm run zip
   ```
   > You will find the compressed `.zip` distribution in the generated `.output/` folder.

## 💻 Usage

1. Open the **Side Panel** in Chrome by clicking the extension icon or toggling the browser's side panel menu.
2. Navigate to the **Settings** tab to adjust reminder frequencies, preferred trajectories, and notification methods.
3. Once an exercise begins, follow the moving ball with your eyes (without moving your head) to effectively massage and stretch eye muscles.

