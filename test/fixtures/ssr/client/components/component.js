import { LitElement, css, html } from "lit";

export default class Component extends LitElement {
  static styles = [
    css`
      @warp-css;
    `,
  ];

  render() {
    return html`
            <section class"text-m">
                <header class="text-xxl">Hello header</header>
            </section>
        `;
  }
}

if (!customElements.get("my-component")) {
  customElements.define("my-component", Component);
}
