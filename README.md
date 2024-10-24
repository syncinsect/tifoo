# Tailware

Tailware is a powerful Chrome extension for real-time inspection and modification of Tailwind CSS classes on web pages.

## Features

- Real-time highlighting of Tailwind classes on page elements
- Visual editing of Tailwind classes
- Autocomplete for Tailwind class names
- Copy Tailwind classes or entire HTML elements
- Support for responsive design classes (sm:, md:, lg:, xl:, 2xl:)

## Installation

1. Clone this repository:

   ```
   git clone https://github.com/syncinsect/tailware.git
   cd tailware
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Build the extension:

   ```
   pnpm build
   ```

   Or, if you want to run in development mode:

   ```
   pnpm dev
   ```

4. Open the Chrome extensions page (chrome://extensions/)

5. Enable "Developer mode"

6. Click "Load unpacked"

7. Select the `tailware/build/chrome-mv3-prod` directory (if you ran `pnpm build`)
   or `tailware/build/chrome-mv3-dev` directory (if you ran `pnpm dev`)

## Development

To run the extension in development mode:

```
pnpm dev
```

This will start the development server and automatically rebuild the extension when files change.

Note: In development mode, load the `tailware/build/chrome-mv3-dev` directory in the Chrome extensions page.

## Usage

1. Click the Tailware icon in the Chrome toolbar to activate the extension
2. Hover over elements on the webpage to highlight them
3. Use the floating window to view and edit Tailwind classes

## Contributing

We welcome and appreciate all contributions! Please see the [GitHub "How to Contribute" Guide](https://docs.github.com/en/get-started/quickstart/contributing-to-projects) for general guidelines on how to contribute to projects.

<!-- Before contributing, please read our [Code of Conduct](CODE_OF_CONDUCT.md).

If you're looking for a place to start, check out our [issues labeled "good first issue"](GITHUB_ISSUES_URL?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

For more detailed information specific to this project, please refer to our [Contributing Guidelines](CONTRIBUTING.md) (if available). -->

## Reporting Issues

If you find a bug or have a feature request, please [submit an issue](https://github.com/syncinsect/tailware/issues/new).

## License

This project is licensed under the [MIT License](LICENSE).

For more information, please see the full [license text](LICENSE).
