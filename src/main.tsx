import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const applyLivaithonBrand = (root: Node) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let textNode: Node | null = walker.nextNode();
  while (textNode) {
    if (textNode.nodeValue?.includes("CYBERFORGE")) {
      textNode.nodeValue = textNode.nodeValue.replaceAll("CYBERFORGE", "LIVAITHON");
    }
    textNode = walker.nextNode();
  }
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

const root = document.getElementById("root")!;
requestAnimationFrame(() => applyLivaithonBrand(root));
new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => applyLivaithonBrand(node));
  }
}).observe(root, { childList: true, subtree: true });
