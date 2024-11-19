import type {
  PlasmoCSConfig,
  PlasmoGetRootContainer,
  PlasmoRender,
} from "plasmo";
import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import cssText from "data-text:./styles/index.css";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
};

export const getRootContainer: PlasmoGetRootContainer = () => {
  const container = document.createElement("tifoo-container");
  const shadowRoot = container.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = cssText;
  shadowRoot.appendChild(style);

  const appContainer = document.createElement("div");
  appContainer.className = "tifoo-root";
  shadowRoot.appendChild(appContainer);

  container.style.inset = "0";
  container.style.zIndex = "9999";
  appContainer.style.pointerEvents = "auto";

  document.documentElement.appendChild(container);

  return appContainer;
};

export const render: PlasmoRender<typeof App> = async ({
  createRootContainer,
}) => {
  const rootContainer = await (createRootContainer as () => Promise<Element>)();
  const root = createRoot(rootContainer);
  root.render(<App />);
};
