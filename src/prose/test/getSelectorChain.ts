export function getSelectorChain(n: Node | null | undefined) {
  if (!n) return "";
  let chain: string[] = [];
  let currentEl: Node | null = n;

  while (currentEl) {
    if (currentEl instanceof HTMLBodyElement) break;
    let node = "";
    if (currentEl instanceof Element) {
      node += currentEl.tagName.toLowerCase();
      if (currentEl.id) {
        node += `#${currentEl.id}`;
      }
      if (currentEl.classList.length) {
        node += `.${Array.from(currentEl.classList).join(".")}`;
      }
      chain.push(node);
      currentEl = currentEl.parentElement;
    } else if (currentEl instanceof Text) {
      node += `text("${currentEl.textContent}")`;
      chain.push(node);
      currentEl = currentEl.parentElement;
    }
  }
  return chain.reverse().join(" > ");
}
