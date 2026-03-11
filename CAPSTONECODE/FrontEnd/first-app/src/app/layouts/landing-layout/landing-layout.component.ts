import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-landing-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './landing-layout.component.html',
    styles: [`
    :host { display: block; }
  `]
})
export class LandingLayoutComponent {}
