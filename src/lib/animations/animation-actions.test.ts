/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { animate, staggerAnimate } from './animation-actions';
import type { Action } from 'svelte/action';
import * as animationUtils from './animation-utils';

// Mock the animation utility functions
vi.mock('./animation-utils', () => ({
    fadeIn: vi.fn().mockResolvedValue({ animation: 'mock-fade-in' }),
    fadeOut: vi.fn().mockResolvedValue({ animation: 'mock-fade-out' }),
    slideIn: vi.fn().mockResolvedValue({ animation: 'mock-slide-in' }),
    scaleIn: vi.fn().mockResolvedValue({ animation: 'mock-scale-in' }),
    applyPreset: vi.fn((preset, overrides) => ({
        ...{ opacity: 0, duration: 0.5, ease: 'power2.out' },
        ...overrides
    })),
    staggerAnimation: vi.fn().mockResolvedValue({ animation: 'mock-stagger' }),
    createTimeline: vi.fn().mockResolvedValue({ timeline: 'mock-timeline' })
}));

// Mock GSAPService
vi.mock('./gsap-service', () => ({
    GSAPService: {
        getInstance: vi.fn(() => ({
            loadGSAP: vi.fn().mockResolvedValue({
                from: vi.fn().mockReturnValue({ animation: 'mock-from' }),
                to: vi.fn().mockReturnValue({ animation: 'mock-to' })
            })
        }))
    }
}));

describe('Animation Actions', () => {
    let element: HTMLElement;
    let childElements: HTMLElement[];
    let parentElement: HTMLElement;

    beforeEach(() => {
        // Create test elements
        element = document.createElement('div');

        // Create parent with children for stagger tests
        parentElement = document.createElement('ul');
        for (let i = 0; i < 3; i++) {
            const li = document.createElement('li');
            parentElement.appendChild(li);
        }
        childElements = Array.from(parentElement.querySelectorAll('li'));

        // Reset mocks
        vi.clearAllMocks();
    });

    describe('animate action', () => {
        it('should call fadeIn with default parameters', async () => {
            const action = animate(element, { animation: 'fadeIn' });

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(animationUtils.fadeIn).toHaveBeenCalledWith(element, undefined, undefined);
        });

        it('should call fadeIn with custom duration and delay', async () => {
            const action = animate(element, {
                animation: 'fadeIn',
                duration: 1.0,
                delay: 0.2
            });

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(animationUtils.fadeIn).toHaveBeenCalledWith(element, 1.0, 0.2);
        });

        it('should call slideIn with the correct direction', async () => {
            const action = animate(element, { animation: 'slideInRight' });

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(animationUtils.slideIn).toHaveBeenCalledWith(
                element,
                'right',
                undefined,
                undefined,
                undefined
            );
        });

        it('should call slideIn with custom distance, duration and delay', async () => {
            const action = animate(element, {
                animation: 'slideInLeft',
                distance: 200,
                duration: 1.0,
                delay: 0.2
            });

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(animationUtils.slideIn).toHaveBeenCalledWith(
                element,
                'left',
                200,
                1.0,
                0.2
            );
        });

        it('should call scaleIn with custom scale, duration and delay', async () => {
            const action = animate(element, {
                animation: 'scaleIn',
                scale: 0.5,
                duration: 1.0,
                delay: 0.2
            });

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(animationUtils.scaleIn).toHaveBeenCalledWith(
                element,
                0.5,
                1.0,
                0.2
            );
        });

        it('should apply a custom animation config', async () => {
            const action = animate(element, {
                animation: {
                    opacity: 0,
                    x: 100,
                    duration: 0.8
                }
            });

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(animationUtils.fadeIn).toHaveBeenCalledWith(element, 0.8, undefined);
        });

        it('should update parameters when update is called', async () => {
            const action = animate(element, { animation: 'fadeIn' });

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            // Clear the mock to check the next call
            vi.clearAllMocks();

            // Update the action
            if (action && typeof action === 'object' && 'update' in action && typeof action.update === 'function') {
                action.update({ animation: 'fadeIn', duration: 2.0 });
            }

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(animationUtils.fadeIn).toHaveBeenCalledWith(element, 2.0, undefined);
        });

        it('should not play animation if playOnMount is false', async () => {
            const action = animate(element, {
                animation: 'fadeIn',
                playOnMount: false
            });

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(animationUtils.fadeIn).not.toHaveBeenCalled();
        });
    });

    describe('staggerAnimate action', () => {
        it('should query child elements and apply staggered animation', async () => {
            // Mock querySelectorAll to return our child elements
            const querySelectorAllSpy = vi.spyOn(parentElement, 'querySelectorAll')
                .mockReturnValue(childElements as any);

            const action = staggerAnimate(parentElement, {
                animation: 'fadeIn',
                childSelector: 'li'
            });

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(querySelectorAllSpy).toHaveBeenCalledWith('li');

            // Check that the GSAPService was used to get GSAP
            // and that gsap.from was called with the children
            const gsapService = (await import('./gsap-service')).GSAPService;
            expect(gsapService.getInstance).toHaveBeenCalled();
        });

        it('should apply staggered animation with custom stagger amount', async () => {
            // Mock querySelectorAll to return our child elements
            vi.spyOn(parentElement, 'querySelectorAll')
                .mockReturnValue(childElements as any);

            const action = staggerAnimate(parentElement, {
                animation: 'fadeIn',
                childSelector: 'li',
                staggerAmount: 0.2
            });

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            // Check that applyPreset was called with the right parameters
            expect(animationUtils.applyPreset).toHaveBeenCalledWith('fadeIn', {
                duration: undefined,
                delay: undefined
            });
        });

        it('should not play animation if there are no matching children', async () => {
            // Mock querySelectorAll to return empty NodeList
            vi.spyOn(parentElement, 'querySelectorAll')
                .mockReturnValue([] as any);

            const action = staggerAnimate(parentElement, {
                animation: 'fadeIn',
                childSelector: '.non-existent'
            });

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            // GSAPService should not be used if there are no children
            const gsapService = (await import('./gsap-service')).GSAPService;
            expect(gsapService.getInstance).not.toHaveBeenCalled();
        });

        it('should update parameters when update is called', async () => {
            // Mock querySelectorAll to return our child elements
            const querySelectorAllSpy = vi.spyOn(parentElement, 'querySelectorAll')
                .mockReturnValue(childElements as any);

            const action = staggerAnimate(parentElement, {
                animation: 'fadeIn',
                childSelector: 'li'
            });

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            // Clear mocks to check the next call
            vi.clearAllMocks();
            querySelectorAllSpy.mockClear();

            // Update the action
            if (action && typeof action === 'object' && 'update' in action && typeof action.update === 'function') {
                action.update({
                    animation: 'fadeIn',
                    childSelector: '.item',
                    staggerAmount: 0.3
                });
            }

            // Wait for any promises to resolve
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(querySelectorAllSpy).toHaveBeenCalledWith('.item');
        });
    });
}); 