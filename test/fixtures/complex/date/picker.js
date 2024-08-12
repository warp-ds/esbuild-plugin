import { LitElement, css, html } from "lit";
import { date } from "./builder.js";

export default class DatePicker extends LitElement {
  static styles = [
    css`
      @warp-css;
    `,
  ];

  render() {
    return html`
      <div>
        <header class="font-bold">This is a date</header>
        ${date()}
      </div>
    `;
  }
}

if (!customElements.get("date-picker")) {
  customElements.define("date-picker", DatePicker);
}
