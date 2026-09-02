import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { VwrHeaderComponent } from './app/vwr-header.component';

// Tag name the vwr repo's `mfe` block config should reference (see the block's
// _mfe.json "Tag Name" field).
const TAG_NAME = 'vwr-header-mfe';

// The `mfe` block does `await import(scriptUrl)` and only then does
// `document.createElement(tagName)` - so `customElements.define` below MUST have
// already run by the time this module's dynamic import() promise resolves.
// A dynamic import() resolves once a module's top-level synchronous execution
// (including any top-level `await`, which this is) completes - it does NOT wait
// for an unawaited async IIFE's internal awaits. Using top-level await here,
// rather than a fire-and-forget `(async () => { ... })()`, is what makes that
// contract hold.
if (!customElements.get(TAG_NAME)) {
  const app = await createApplication({
    providers: [provideExperimentalZonelessChangeDetection()],
  });

  const element = createCustomElement(VwrHeaderComponent, { injector: app.injector });
  customElements.define(TAG_NAME, element);
}
