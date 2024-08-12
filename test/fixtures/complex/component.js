import { LitElement, css, html } from "lit";
import { header } from "./templates.js";
import "./date/picker.js";

export default class Component extends LitElement {
  static styles = [
    css`
      @warp-css;
    `,
  ];

  render() {
    return html`
            <section class"text-m">
                ${header()}
                <date-picker></date-picker>	    
            </section>
        `;
  }
}
