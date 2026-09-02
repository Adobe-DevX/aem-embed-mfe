/*
 * Lightweight fragment embed custom element.
 *
 * The reference implementation (https://github.com/adobe/aem-embed) decorates
 * a fragment by dynamically importing the source project's own scripts.js and
 * running its full decorateMain(). That assumes scripts.js can run standalone
 * inside a foreign host page. On a Commerce/dropins-enabled AEM project,
 * scripts.js also bootstraps commerce config and touches page-level DOM
 * (header/footer) that only exists on the real site, so it throws when run
 * here instead of decorating anything.
 *
 * This element skips that bootstrap and applies only the piece a fragment
 * actually needs: find the block div(s) in the fetched markup, and load each
 * block's own {name}.js/{name}.css directly from the source origin.
 */

export class FragmentEmbed extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.initialized = false;
  }

  // Resolves url(...) references in fetched CSS text against the
  // stylesheet's own URL, so relative font/image paths still work once the
  // rules are injected as inline <style> (whose relative URLs would
  // otherwise resolve against *our* document instead).
  absolutizeCssUrls(css, base) {
    return css.replace(/url\((['"]?)([^'")]+)\1\)/g, (match, quote, url) => {
      if (/^(data:|https?:)/.test(url)) return match;
      return `url(${quote}${new URL(url, base).href}${quote})`;
    });
  }

  // Fetches a remote stylesheet and injects it as a <style> element instead
  // of a <link>. This is needed because the source project defines its
  // design tokens (fonts, colors, spacing) as custom properties under
  // `:root`, and `:root` never matches inside a Shadow DOM (a shadow tree
  // has no document-root element) - so loaded via <link>, none of those
  // variables would ever apply here. Duplicating `:root` rules onto `:host`
  // makes them apply at the shadow boundary instead. This is the client-side
  // equivalent of the "add :host selectors alongside :root" adjustment the
  // aem-embed doc asks source projects to make.
  async loadStylesheet(href) {
    try {
      const resp = await fetch(href);
      if (!resp.ok) return;
      let css = await resp.text();

      // Inline first-level @import so the :root -> :host rewrite below also
      // reaches imported files (the browser resolves @import natively, and
      // we can't rewrite an imported file's selectors after the fact).
      const importRe = /@import\s+url\((['"]?)([^'")]+)\1\)\s*;?/g;
      const imports = [...css.matchAll(importRe)];
      for (const match of imports) {
        const importedHref = new URL(match[2], href).href;
        // eslint-disable-next-line no-await-in-loop
        const importedResp = await fetch(importedHref);
        // eslint-disable-next-line no-await-in-loop
        const importedCss = importedResp.ok ? await importedResp.text() : '';
        css = css.replace(match[0], this.absolutizeCssUrls(importedCss, importedHref));
      }

      css = this.absolutizeCssUrls(css, href);
      css = css.replace(/:root\b/g, ':root, :host');

      const style = document.createElement('style');
      style.textContent = css;
      this.shadowRoot.appendChild(style);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`fragment-embed: failed to load stylesheet ${href}`, err);
    }
  }

  async loadBlock(block, blockName, origin) {
    await this.loadStylesheet(`${origin}/blocks/${blockName}/${blockName}.css`);
    try {
      const mod = await import(`${origin}/blocks/${blockName}/${blockName}.js`);
      if (mod.default) await mod.default(block);
      block.dataset.blockStatus = 'loaded';
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`fragment-embed: failed to load block "${blockName}"`, err);
    }
  }

  async connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const url = this.getAttribute('url');
      if (!url) throw new Error('fragment-embed missing url attribute');

      const plainUrl = url.endsWith('/') ? `${url}index.plain.html` : `${url}.plain.html`;
      const { href, origin } = new URL(plainUrl);

      const resp = await fetch(href);
      if (!resp.ok) throw new Error(`Unable to fetch ${href}`);
      const htmlText = (await resp.text()).replace(/\.\/media/g, `${origin}/media`);

      // A fragment's .plain.html is just its own content div(s) - no <main>
      // wrapper. Block CSS is commonly scoped as `main .section .block-name`
      // (matching the shape of a real page), so without this the block's own
      // stylesheet rules never match anything.
      const container = document.createElement('main');
      container.style.display = 'none';
      container.innerHTML = htmlText;
      this.shadowRoot.appendChild(container);

      await Promise.all([
        this.loadStylesheet(`${origin}/styles/styles.css`),
        this.loadStylesheet(`${origin}/styles/fonts.css`),
      ]);

      // A block div in fetched fragment markup carries exactly one class:
      // its own name (e.g. "hero-lab"). Everything else is unclassed
      // structural wrapping, so this can't accidentally match those.
      const blocks = Array.from(container.querySelectorAll('[class]'))
        .filter((el) => el.classList.length === 1);

      // Block CSS is commonly scoped as `main .section .block-name ...`
      // (matching what the source project's own decorateSections() would
      // produce). We don't run that decoration pass, so replicate just the
      // one piece it's relied on for: tag each block's direct wrapper as
      // a section.
      blocks.forEach((block) => {
        const section = block.parentElement;
        if (section && !section.classList.contains('section')) {
          section.classList.add('section');
          section.dataset.sectionStatus = 'loaded';
        }
      });

      await Promise.all(blocks.map((block) => {
        const blockName = block.classList[0];
        block.classList.add('block');
        block.dataset.blockName = blockName;
        return this.loadBlock(block, blockName, origin);
      }));

      container.style.display = '';
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('fragment-embed:', err);
    }
  }
}

customElements.define('fragment-embed', FragmentEmbed);
