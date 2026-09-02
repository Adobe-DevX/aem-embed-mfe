import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import { NAV_SECTIONS, SITE_ORIGIN, NavSection } from './nav-data';

// Matches the real header's own behaviour (see vwr blocks/header/header.js):
// mega menu opens/closes on click above this width, becomes an accordion below it.
const DESKTOP_BREAKPOINT = '(min-width: 900px)';

@Component({
  selector: 'app-vwr-header',
  standalone: true,
  templateUrl: './vwr-header.component.html',
  styleUrl: './vwr-header.component.css',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VwrHeaderComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isDesktop = window.matchMedia(DESKTOP_BREAKPOINT);

  readonly siteOrigin = SITE_ORIGIN;
  readonly navSections = NAV_SECTIONS;
  readonly mobileOpen = signal(false);
  readonly openSectionLabel = signal<string | null>(null);

  constructor() {
    const onViewportChange = () => {
      this.mobileOpen.set(false);
      this.openSectionLabel.set(null);
    };
    this.isDesktop.addEventListener('change', onViewportChange);
    this.destroyRef.onDestroy(() => this.isDesktop.removeEventListener('change', onViewportChange));
  }

  absoluteHref(path: string): string {
    return `${this.siteOrigin}${path}`;
  }

  searchAction(): string {
    return `${this.siteOrigin}/us/en/search`;
  }

  toggleMobileMenu(): void {
    this.mobileOpen.update((open) => !open);
    if (!this.mobileOpen()) this.openSectionLabel.set(null);
  }

  toggleSection(section: NavSection, event: Event): void {
    if (this.isDesktop.matches) {
      // Desktop: the top-level link opens/closes the mega menu instead of navigating.
      event.preventDefault();
      this.openSectionLabel.update((current) => (current === section.label ? null : section.label));
    } else {
      // Mobile: tapping the top-level item expands its accordion in place.
      event.preventDefault();
      this.openSectionLabel.update((current) => (current === section.label ? null : section.label));
    }
  }

  closeMegaMenu(): void {
    this.openSectionLabel.set(null);
  }

  // Mirrors the real header's outside-click / focus-lost handling, simplified.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.openSectionLabel() === null) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeMegaMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.openSectionLabel() !== null) {
      this.closeMegaMenu();
    } else if (this.mobileOpen()) {
      this.toggleMobileMenu();
    }
  }
}
