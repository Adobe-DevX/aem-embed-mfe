import { Component } from '@angular/core';
import { HeroFragmentComponent } from './hero-fragment/hero-fragment.component';
import { CardFragmentComponent } from './card-fragment/card-fragment.component';

@Component({
  selector: 'app-root',
  imports: [HeroFragmentComponent, CardFragmentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'aem-embed-demo';
}
