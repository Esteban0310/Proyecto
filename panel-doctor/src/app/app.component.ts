import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,          //standalone
  imports: [RouterOutlet],   //para poder usar <router-outlet>
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}
