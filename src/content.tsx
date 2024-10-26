import type {
  PlasmoCSConfig,
  PlasmoGetRootContainer,
  PlasmoRender,
} from "plasmo";
import React from "react";
import { createRoot } from "react-dom/client";

import App from "./components/App";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
};

export const getRootContainer: PlasmoGetRootContainer = () => {
  const container = document.createElement("tailware-container");
  document.documentElement.appendChild(container);
  return container;
};

export const render: PlasmoRender<typeof App> = async ({
  createRootContainer,
}) => {
  const rootContainer = await (createRootContainer as () => Promise<Element>)();
  const root = createRoot(rootContainer);
  root.render(<App />);
};
