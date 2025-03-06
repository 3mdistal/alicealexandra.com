/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    fadeIn,
    fadeOut,
    slideIn,
    scaleIn,
    animationPresets,
    applyPreset,
    staggerAnimation,
    createTimeline
} from './animation-utils';
import { GSAPService } from './gsap-service';

// Mock GSAP
vi.mock('gsap', () => {
    const mockGsap = {
        default: {
            registerPlugin: vi.fn(),
            context: vi.fn(() => ({
                revert: vi.fn()
            })),
            from: vi.fn().mockReturnValue({ animation: 'mock-from-animation' }),
            to: vi.fn().mockReturnValue({ animation: 'mock-to-animation' }),
            timeline: vi.fn().mockReturnValue({ timeline: 'mock-timeline' })
        }
    };
    return mockGsap;
});

describe('Animation Utilities', () => {
    let mockElement: HTMLElement;
    let mockElements: HTMLElement[];
    let gsapInstance: any;

    beforeEach(async () => {
        // Reset the GSAPService
        GSAPService.resetInstance();

        // Create a mock element
        mockElement = document.createElement('div');

        // Create mock elements for stagger tests
        mockElements = [
            document.createElement('div'),
            document.createElement('div'),
            document.createElement('div')
        ];

        // Get the GSAP instance for spying
        const gsapService = GSAPService.getInstance();
        gsapInstance = await gsapService.loadGSAP();

        // Clear all mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        GSAPService.resetInstance();
    });

    describe('fadeIn', () => {
        it('should create a fade in animation with default parameters', async () => {
            const animation = await fadeIn(mockElement);

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElement, {
                opacity: 0,
                duration: 0.5,
                delay: 0,
                ease: 'power2.out'
            });

            expect(animation).toEqual({ animation: 'mock-from-animation' });
        });

        it('should create a fade in animation with custom parameters', async () => {
            const animation = await fadeIn(mockElement, 1.0, 0.2);

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElement, {
                opacity: 0,
                duration: 1.0,
                delay: 0.2,
                ease: 'power2.out'
            });
        });
    });

    describe('fadeOut', () => {
        it('should create a fade out animation with default parameters', async () => {
            const animation = await fadeOut(mockElement);

            expect(gsapInstance.to).toHaveBeenCalledWith(mockElement, {
                opacity: 0,
                duration: 0.5,
                delay: 0,
                ease: 'power2.in'
            });

            expect(animation).toEqual({ animation: 'mock-to-animation' });
        });

        it('should create a fade out animation with custom parameters', async () => {
            const animation = await fadeOut(mockElement, 1.0, 0.2);

            expect(gsapInstance.to).toHaveBeenCalledWith(mockElement, {
                opacity: 0,
                duration: 1.0,
                delay: 0.2,
                ease: 'power2.in'
            });
        });
    });

    describe('slideIn', () => {
        it('should create a slide in animation from left by default', async () => {
            const animation = await slideIn(mockElement);

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElement, {
                x: -100,
                y: 0,
                opacity: 0,
                duration: 0.5,
                delay: 0,
                ease: 'power2.out'
            });
        });

        it('should create a slide in animation from right', async () => {
            const animation = await slideIn(mockElement, 'right');

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElement, {
                x: 100,
                y: 0,
                opacity: 0,
                duration: 0.5,
                delay: 0,
                ease: 'power2.out'
            });
        });

        it('should create a slide in animation from top', async () => {
            const animation = await slideIn(mockElement, 'top');

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElement, {
                x: 0,
                y: -100,
                opacity: 0,
                duration: 0.5,
                delay: 0,
                ease: 'power2.out'
            });
        });

        it('should create a slide in animation from bottom', async () => {
            const animation = await slideIn(mockElement, 'bottom');

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElement, {
                x: 0,
                y: 100,
                opacity: 0,
                duration: 0.5,
                delay: 0,
                ease: 'power2.out'
            });
        });

        it('should create a slide in animation with custom distance', async () => {
            const animation = await slideIn(mockElement, 'left', 200);

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElement, {
                x: -200,
                y: 0,
                opacity: 0,
                duration: 0.5,
                delay: 0,
                ease: 'power2.out'
            });
        });

        it('should create a slide in animation with custom duration and delay', async () => {
            const animation = await slideIn(mockElement, 'left', 100, 1.0, 0.2);

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElement, {
                x: -100,
                y: 0,
                opacity: 0,
                duration: 1.0,
                delay: 0.2,
                ease: 'power2.out'
            });
        });
    });

    describe('scaleIn', () => {
        it('should create a scale in animation with default parameters', async () => {
            const animation = await scaleIn(mockElement);

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElement, {
                scale: 0.8,
                opacity: 0,
                duration: 0.5,
                delay: 0,
                ease: 'back.out(1.7)'
            });
        });

        it('should create a scale in animation with custom scale', async () => {
            const animation = await scaleIn(mockElement, 0.5);

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElement, {
                scale: 0.5,
                opacity: 0,
                duration: 0.5,
                delay: 0,
                ease: 'back.out(1.7)'
            });
        });

        it('should create a scale in animation with custom duration and delay', async () => {
            const animation = await scaleIn(mockElement, 0.8, 1.0, 0.2);

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElement, {
                scale: 0.8,
                opacity: 0,
                duration: 1.0,
                delay: 0.2,
                ease: 'back.out(1.7)'
            });
        });
    });

    describe('animationPresets', () => {
        it('should have the expected presets', () => {
            expect(animationPresets).toHaveProperty('fadeIn');
            expect(animationPresets).toHaveProperty('fadeOut');
            expect(animationPresets).toHaveProperty('slideInLeft');
            expect(animationPresets).toHaveProperty('slideInRight');
            expect(animationPresets).toHaveProperty('slideInUp');
            expect(animationPresets).toHaveProperty('slideInDown');
            expect(animationPresets).toHaveProperty('scaleIn');
        });

        it('should have the correct properties for fadeIn preset', () => {
            expect(animationPresets.fadeIn).toEqual({
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });

        it('should have the correct properties for slideInLeft preset', () => {
            expect(animationPresets.slideInLeft).toEqual({
                x: -100,
                opacity: 0,
                duration: 0.7,
                ease: 'power2.out'
            });
        });
    });

    describe('applyPreset', () => {
        it('should apply a preset without custom config', () => {
            const config = applyPreset('fadeIn');

            expect(config).toEqual({
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });

        it('should apply a preset with custom config', () => {
            const config = applyPreset('fadeIn', { duration: 1.0, delay: 0.2 });

            expect(config).toEqual({
                opacity: 0,
                duration: 1.0,
                delay: 0.2,
                ease: 'power2.out'
            });
        });

        it('should override preset values with custom config', () => {
            const config = applyPreset('fadeIn', { opacity: 0.5, ease: 'power3.out' });

            expect(config).toEqual({
                opacity: 0.5,
                duration: 0.5,
                ease: 'power3.out'
            });
        });
    });

    describe('staggerAnimation', () => {
        it('should create a staggered animation with default parameters', async () => {
            const animation = await staggerAnimation(mockElements, 'fadeIn');

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElements, {
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out',
                stagger: 0.1
            });
        });

        it('should create a staggered animation with custom stagger amount', async () => {
            const animation = await staggerAnimation(mockElements, 'fadeIn', 0.2);

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElements, {
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out',
                stagger: 0.2
            });
        });

        it('should create a staggered animation with custom config', async () => {
            const animation = await staggerAnimation(
                mockElements,
                'fadeIn',
                0.1,
                { duration: 1.0, delay: 0.2 }
            );

            expect(gsapInstance.from).toHaveBeenCalledWith(mockElements, {
                opacity: 0,
                duration: 1.0,
                delay: 0.2,
                ease: 'power2.out',
                stagger: 0.1
            });
        });
    });

    describe('createTimeline', () => {
        it('should create a timeline with default parameters', async () => {
            const timeline = await createTimeline();

            expect(gsapInstance.timeline).toHaveBeenCalledWith({});
            expect(timeline).toEqual({ timeline: 'mock-timeline' });
        });

        it('should create a timeline with custom parameters', async () => {
            const timeline = await createTimeline({ paused: true, repeat: 2 });

            expect(gsapInstance.timeline).toHaveBeenCalledWith({ paused: true, repeat: 2 });
        });
    });
}); 