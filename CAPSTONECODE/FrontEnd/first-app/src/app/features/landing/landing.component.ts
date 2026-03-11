import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './landing.component.html'
})
export class LandingComponent implements OnInit, OnDestroy {
    // Array of Unsplash images representing different business profiles
    slides = [
        '/assets/hero-office.png',
        '/assets/hero-industrial.png',
        '/assets/hero-retail.png'
    ];

    activeSlideIndex = signal(0);
    private timer: any;

    ngOnInit() {
        this.timer = setInterval(() => {
            this.activeSlideIndex.set((this.activeSlideIndex() + 1) % this.slides.length);
        }, 4000); // Rotate every 4 seconds
    }

    ngOnDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}
