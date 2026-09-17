const VWR_SHELL_VERSION = '0.1.0';

const sharedStyles = `
  :host {
    --vwr-blue: #236192;
    --vwr-blue-dark: #17486f;
    --vwr-green: #00a651;
    --vwr-text: #30343b;
    --vwr-muted: #5b6168;
    --vwr-border: #d8dde2;
    --vwr-surface: #f4f5f6;
    display: block;
    color: var(--vwr-text);
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.4;
  }

  *, *::before, *::after { box-sizing: border-box; }
  a { color: inherit; }
  button, input { font: inherit; }
  .container { width: min(100% - 32px, 1440px); margin-inline: auto; }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

class VwrHeader extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}

        header { background: #fff; border-bottom: 1px solid var(--vwr-border); }
        .utility { background: var(--vwr-surface); color: var(--vwr-muted); font-size: 12px; }
        .utility .container { min-height: 30px; display: flex; align-items: center; justify-content: flex-end; gap: 22px; }
        .utility-action { padding: 0; border: 0; background: transparent; color: inherit; cursor: pointer; font-size: inherit; }
        .utility-action:hover { color: var(--vwr-blue); text-decoration: underline; }
        .primary { min-height: 78px; display: grid; grid-template-columns: 180px minmax(260px, 1fr) auto; align-items: center; gap: 28px; }
        .logo { display: inline-flex; flex-direction: column; width: fit-content; color: var(--vwr-blue); line-height: 1; }
        .logo-main { font-size: 38px; font-weight: 800; letter-spacing: -2px; }
        .logo-sub { margin-top: 3px; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
        .search { display: flex; min-width: 0; }
        .search input {
          width: 100%;
          min-width: 0;
          height: 44px;
          padding: 0 14px;
          color: var(--vwr-text);
          border: 1px solid #89939d;
          border-right: 0;
          border-radius: 3px 0 0 3px;
          outline: none;
        }
        .search input:focus { border-color: var(--vwr-blue); box-shadow: inset 0 0 0 1px var(--vwr-blue); }
        .search button {
          width: 52px;
          border: 1px solid var(--vwr-blue);
          border-radius: 0 3px 3px 0;
          background: var(--vwr-blue);
          color: #fff;
          cursor: pointer;
          font-size: 20px;
        }
        .actions { display: flex; align-items: center; gap: 22px; }
        .action { padding: 0; border: 0; background: transparent; color: var(--vwr-blue); text-align: left; font-size: 14px; white-space: nowrap; cursor: pointer; }
        .action strong { display: block; font-size: 15px; }
        .cart-count {
          display: inline-grid;
          place-items: center;
          min-width: 22px;
          height: 22px;
          margin-left: 5px;
          padding-inline: 5px;
          border-radius: 11px;
          background: var(--vwr-green);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
        }
        .nav { border-top: 1px solid var(--vwr-border); }
        .nav .container { min-height: 48px; display: flex; align-items: stretch; gap: 34px; }
        .nav button { display: inline-flex; align-items: center; padding: 0; border: 0; background: transparent; color: var(--vwr-blue); font-weight: 700; font-size: 14px; cursor: pointer; }
        .nav button:hover { color: var(--vwr-blue-dark); text-decoration: underline; }
        .menu-button { display: none; }

        @media (max-width: 800px) {
          .container { width: min(100% - 24px, 1440px); }
          .utility { display: none; }
          .primary { min-height: 70px; grid-template-columns: auto 1fr auto; gap: 14px; }
          .logo-main { font-size: 31px; }
          .search { grid-column: 1 / -1; grid-row: 2; padding-bottom: 14px; }
          .actions .account { display: none; }
          .menu-button {
            display: inline-grid;
            place-items: center;
            width: 40px;
            height: 40px;
            padding: 0;
            border: 0;
            background: transparent;
            color: var(--vwr-blue);
            cursor: pointer;
            font-size: 24px;
          }
          .nav { display: none; }
          .nav.open { display: block; }
          .nav .container { min-height: 0; padding-block: 8px 16px; flex-direction: column; gap: 0; }
          .nav button { min-height: 42px; border-bottom: 1px solid var(--vwr-border); }
        }
      </style>

      <header>
        <div class="utility">
          <div class="container">
            <span>VWR, part of Avantor</span>
            <button class="utility-action" type="button" data-action="contact-us">Contact us</button>
            <span>US / EN</span>
          </div>
        </div>

        <div class="primary container">
          <button class="menu-button" type="button" aria-expanded="false" aria-controls="vwr-navigation" aria-label="Open navigation">☰</button>
          <button class="logo action" type="button" data-action="home" aria-label="VWR home">
            <span class="logo-main">VWR</span>
            <span class="logo-sub">part of Avantor</span>
          </button>

          <form class="search" role="search">
            <label class="sr-only" for="vwr-search">Search VWR products</label>
            <input id="vwr-search" name="query" type="search" placeholder="Search by product, catalog number, CAS number…" autocomplete="off">
            <button type="submit" aria-label="Search">⌕</button>
          </form>

          <div class="actions">
            <button class="action account" type="button" data-action="account"><strong>Sign in</strong>My account</button>
            <button class="action" type="button" data-action="cart"><strong>Cart <span class="cart-count">0</span></strong></button>
          </div>
        </div>

        <nav class="nav" id="vwr-navigation" aria-label="Primary navigation">
          <div class="container">
            <button type="button" data-action="products">Products</button>
            <button type="button" data-action="applications">Applications</button>
            <button type="button" data-action="services">Services</button>
            <button type="button" data-action="resources">Resources</button>
            <button type="button" data-action="deals">Deals</button>
          </div>
        </nav>
      </header>
    `;

    const menuButton = this.shadowRoot.querySelector('.menu-button');
    const nav = this.shadowRoot.querySelector('.nav');
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });

    this.shadowRoot.querySelector('.search').addEventListener('submit', event => {
      event.preventDefault();
      const query = new FormData(event.currentTarget).get('query')?.toString().trim();
      if (query) {
        this.dispatchEvent(new CustomEvent('vwr:search', {
          bubbles: true,
          composed: true,
          detail: { query },
        }));
      }
    });

    this.shadowRoot.querySelectorAll('[data-action]').forEach(element => {
      element.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('vwr:action', {
          bubbles: true,
          composed: true,
          detail: { action: element.dataset.action },
        }));
      });
    });
  }
}

class VwrFooter extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    const year = new Date().getFullYear();

    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}

        footer { margin-top: 48px; background: var(--vwr-surface); border-top: 1px solid var(--vwr-border); }
        .body { padding-block: 42px 30px; }
        .intro { max-width: 980px; margin: 0 0 34px; color: var(--vwr-muted); font-size: 14px; line-height: 1.7; }
        .links { display: grid; grid-template-columns: repeat(4, minmax(150px, 1fr)); gap: 28px; }
        h2 { margin: 0 0 12px; color: var(--vwr-text); font-size: 15px; }
        ul { margin: 0; padding: 0; list-style: none; }
        li + li { margin-top: 9px; }
        .link-button { color: var(--vwr-blue); font-size: 14px; text-decoration: none; }
        .link-button:hover { text-decoration: underline; }
        .link-button { padding: 0; border: 0; background: transparent; cursor: pointer; }
        .legal { display: flex; justify-content: space-between; gap: 24px; padding-block: 22px; border-top: 1px solid #aeb5bc; color: var(--vwr-muted); font-size: 12px; }
        .legal-links { display: flex; flex-wrap: wrap; gap: 8px 20px; }

        @media (max-width: 800px) {
          footer { margin-top: 32px; }
          .container { width: min(100% - 24px, 1440px); }
          .body { padding-block: 30px 24px; }
          .links { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 20px; }
          .legal { flex-direction: column; }
        }

        @media (max-width: 480px) {
          .links { grid-template-columns: 1fr; }
        }
      </style>

      <footer>
        <div class="body container">
          <p class="intro">Avantor® is a leading life science tools company and global provider of mission-critical products and services to the life sciences and advanced technology industries. We work side-by-side with customers at every step of the scientific journey.</p>

          <div class="links">
            <section>
              <h2>Shopping</h2>
              <ul>
                <li><button class="link-button" type="button" data-action="shop">Shop from us</button></li>
                <li><button class="link-button" type="button" data-action="customer-support">Customer support</button></li>
                <li><button class="link-button" type="button" data-action="contact-us">Contact us</button></li>
              </ul>
            </section>
            <section>
              <h2>Work with Avantor</h2>
              <ul>
                <li><button class="link-button" type="button" data-action="how-to-buy">How to buy</button></li>
                <li><button class="link-button" type="button" data-action="shipping">How we ship</button></li>
                <li><button class="link-button" type="button" data-action="channel-partners">Find a channel partner</button></li>
              </ul>
            </section>
            <section>
              <h2>Company</h2>
              <ul>
                <li><button class="link-button" type="button" data-action="about">About Avantor</button></li>
                <li><button class="link-button" type="button" data-action="investors">Investors</button></li>
                <li><button class="link-button" type="button" data-action="careers">Careers</button></li>
              </ul>
            </section>
            <section>
              <h2>Policies</h2>
              <ul>
                <li><button class="link-button" type="button" data-action="terms-and-conditions">Terms and conditions</button></li>
                <li><button class="link-button" type="button" data-action="privacy-policy">Privacy policy</button></li>
                <li><button class="link-button cookie-preferences" type="button">Cookie preferences</button></li>
              </ul>
            </section>
          </div>
        </div>

        <div class="legal container">
          <span>© ${year} Avantor, Inc.</span>
          <div class="legal-links">
            <button class="link-button" type="button" data-action="terms-of-use">Terms of use</button>
            <button class="link-button" type="button" data-action="privacy-policy">Privacy policy</button>
            <button class="link-button" type="button" data-action="do-not-share">Do Not Share My Personal Information</button>
          </div>
        </div>
      </footer>
    `;

    this.shadowRoot.querySelector('.cookie-preferences').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('vwr:cookie-preferences', {
        bubbles: true,
        composed: true,
      }));
    });

    this.shadowRoot.querySelectorAll('[data-action]').forEach(element => {
      element.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('vwr:action', {
          bubbles: true,
          composed: true,
          detail: { action: element.dataset.action },
        }));
      });
    });
  }
}

if (!customElements.get('vwr-header')) customElements.define('vwr-header', VwrHeader);
if (!customElements.get('vwr-footer')) customElements.define('vwr-footer', VwrFooter);

window.VwrShell = Object.freeze({ version: VWR_SHELL_VERSION });
window.dispatchEvent(new CustomEvent('vwr-shell-ready', {
  detail: { version: VWR_SHELL_VERSION },
}));
