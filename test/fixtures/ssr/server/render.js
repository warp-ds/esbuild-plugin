import { render as ssr } from "@lit-labs/ssr";
import { html } from "lit";

import "../client/components/component.js";

export default function render() {
  const results = [...ssr(html`<my-component></my-component>`)];
  return results.join("");
}
