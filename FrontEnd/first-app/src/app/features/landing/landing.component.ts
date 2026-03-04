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
        'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Corporate
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Manufacturing/Industrial
        'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Retail/Storefront
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'  // Construction Jobsite
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
