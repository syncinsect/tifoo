<p align="center">
  <a href="https://github.com/syncinsect/tifoo">
    <img src="/public/tifoo_logo.png" alt="Tifoo Logo" width="40%">
  </a>
</p>

<p align="center">
    <a href="https://github.com/syncinsect/tifoo/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-blue.svg" alt="License"></a>
    <a href="https://github.com/syncinsect/tifoo/releases"><img src="https://img.shields.io/github/v/release/syncinsect/tifoo" alt="GitHub release"></a>
    <a href="https://github.com/syncinsect/tifoo/issues"><img src="https://img.shields.io/github/issues/syncinsect/tifoo.svg" alt="GitHub issues"></a>
    <a href="https://github.com/syncinsect/tifoo/stargazers"><img src="https://img.shields.io/github/stars/syncinsect/tifoo.svg" alt="GitHub stars"></a>
    <a href="https://chromewebstore.google.com/detail/tifoo/fccohfilddfaljiionagbbjelbliokll"><img src="https://img.shields.io/chrome-web-store/users/fccohfilddfaljiionagbbjelbliokll" alt="Chrome Web Store users"></a>
</p>

<h3 align="center">🖲️ Effortless Tailwind Styling at Your Fingertips</h3>

<p align="center">
  <a href="https://www.youtube.com/watch?v=z2EVJyF_s6Q" target="_blank">
    <img src="/public/tifoo_video_cover.png" alt="Tifoo Demo Video" width="80%">
  </a>
</p>

## 🏠 Getting Started

- [💫 What is Tifoo?](#-what-is-tifoo)
- [🌟 Features](#-features)
- [📥 Installation](#-installation)
- [📖 Usage](#-usage)
- [🔧 Development](#-development)
- [🤲 Contributing](#-contributing)
- [⚖️ License](#-license)

## 💫 What is Tifoo?

Tifoo is a free and open-source Chrome extension designed to enhance the Tailwind CSS development experience. It provides real-time inspection and modification capabilities directly in your browser, making development faster and more intuitive.

We aim to make Tailwind CSS development more efficient and enjoyable for developers of all skill levels.

## 🌟 Features

- 🔮 Real-time Element Inspection - Hover to view Tailwind classes
- ✨ Visual Class Editor - Intuitive interface for adding/removing classes
- 📝 Basic Class Autocompletion - Get Tailwind class suggestions while typing
- 🎯 One-click Copy - Quickly copy elements or their classes
- 🖱️ Draggable Interface - Flexibly adjust tool window position
- ⚡ Zero Configuration - Start using immediately after installation
- 📑 Multi-tab Support - Work with multiple pages simultaneously
- 📚 Comprehensive Library - Access to 140,000+ ready-to-use Tailwind classes
- 🎭 Smooth Animations - Fluid transitions and visual feedback
- 🔄 Regular Updates - Stay current with latest Tailwind CSS features
- 🌍 Active Community - Growing ecosystem with worldwide developer support

## 📥 Installation

### Chrome Web Store (Recommended)

Install Tifoo directly from the [Chrome Web Store](https://chrome.google.com/webstore/detail/tifoo/fccohfilddfaljiionagbbjelbliokll).

1. Download the latest release from our [GitHub Releases](https://github.com/syncinsect/tifoo/releases) page
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the downloaded release folder

## 📖 Usage

1. Click the Tifoo icon in the Chrome toolbar to activate the extension
2. Hover over elements on the webpage to highlight them
3. Use the floating window to view and edit Tailwind classes

## 🔧 Development

### Prerequisites

| Requirement | Version |
| ----------- | ------- |
| 📦 Node.js  | >= 16.x |
| 🔄 pnpm     | Latest  |
| 🌐 Chrome   | Latest  |

### Install Dependencies

First, ensure you have Node.js and pnpm installed. Then run:

```bash
pnpm install
```

This will install all the dependencies required for the project.

### Build the Extension

Run the following command to build the extension:

```bash
pnpm build
```

### Start the Development Server

To run the extension in development mode:

```bash
pnpm dev
```

This will start the development server and automatically rebuild the extension when files change.

### Testing

Run the test suite with:

```bash
pnpm test
```

For watch mode during development:

```bash
pnpm test:watch
```

## 🤲 Contributing

Tifoo is and will always be free and open source - built by developers, for developers. This decision stems from our core beliefs:

- 🌱 We serve developers, designers, and beginners in the Tailwind ecosystem
- 🔄 Our users can provide more professional and practical insights, creating a virtuous cycle of improvement
- 🌍 Open source enriches the entire Tailwind ecosystem

We believe that the capabilities of a small team are limited, but through community collaboration, we can create something truly remarkable. Whether you're:

- 🐛 Reporting bugs
- 💭 Suggesting features or sharing ideas
- 💻 Contributing code
- 📝 Improving documentation
- 🎨 Enhancing UI/UX
- 🌐 Helping with translations

Every contribution makes Tifoo better for everyone. Feel free to [open an issue](https://github.com/syncinsect/tifoo/issues) for any suggestions or problems, or submit a [pull request](https://github.com/syncinsect/tifoo/pulls) to contribute directly.

See our [Contributing Guide](CONTRIBUTING.md) for detailed information on how to get started.

Thank you to everyone who helps make Tifoo better! ❤️

## ⚖️ License

This project is licensed under the GNU General Public License v3.0 with Additional Terms - see the [LICENSE](LICENSE) file for details. This means:

- You are free to use, modify, and distribute this software
- Any modifications must also be open source under GPL-3.0
- Distribution through browser extension stores requires permission
- The Tifoo name and branding are protected
