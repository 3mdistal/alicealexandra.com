/**
 * Animation Utilities - Common animation functions and presets
 * 
 * This file provides standardized animation utilities and presets
 * for consistent animations across the application.
 */

import { GSAPService } from './gsap-service';
import type { AnimationDirection, AnimationConfig } from './animation-types';

/**
 * Fade in animation
 * @param element The element to animate
 * @param duration Animation duration in seconds
 * @param delay Animation delay in seconds
 * @returns The GSAP animation instance
 */
export const fadeIn = async (element: HTMLElement, duration = 0.5, delay = 0) => {
    const gsapService = GSAPService.getInstance();
    const gsap = await gsapService.loadGSAP();

    return gsap.from(element, {
        opacity: 0,
        duration,
        delay,
        ease: 'power2.out'
    });
};

/**
 * Fade out animation
 * @param element The element to animate
 * @param duration Animation duration in seconds
 * @param delay Animation delay in seconds
 * @returns The GSAP animation instance
 */
export const fadeOut = async (element: HTMLElement, duration = 0.5, delay = 0) => {
    const gsapService = GSAPService.getInstance();
    const gsap = await gsapService.loadGSAP();

    return gsap.to(element, {
        opacity: 0,
        duration,
        delay,
        ease: 'power2.in'
    });
};

/**
 * Slide in animation
 * @param element The element to animate
 * @param direction Direction to slide from
 * @param distance Distance to slide in pixels
 * @param duration Animation duration in seconds
 * @param delay Animation delay in seconds
 * @returns The GSAP animation instance
 */
export const slideIn = async (
    element: HTMLElement,
    direction: AnimationDirection = 'left',
    distance = 100,
    duration = 0.5,
    delay = 0
) => {
    const gsapService = GSAPService.getInstance();
    const gsap = await gsapService.loadGSAP();

    const x = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
    const y = direction === 'top' ? -distance : direction === 'bottom' ? distance : 0;

    return gsap.from(element, {
        x,
        y,
        opacity: 0,
        duration,
        delay,
        ease: 'power2.out'
    });
};

/**
 * Scale animation
 * @param element The element to animate
 * @param fromScale Starting scale value
 * @param duration Animation duration in seconds
 * @param delay Animation delay in seconds
 * @returns The GSAP animation instance
 */
export const scaleIn = async (
    element: HTMLElement,
    fromScale = 0.8,
    duration = 0.5,
    delay = 0
) => {
    const gsapService = GSAPService.getInstance();
    const gsap = await gsapService.loadGSAP();

    return gsap.from(element, {
        scale: fromScale,
        opacity: 0,
        duration,
        delay,
        ease: 'back.out(1.7)'
    });
};

/**
 * Standardized animation presets
 */
export const animationPresets = {
    fadeIn: {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
    },
    fadeOut: {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in'
    },
    slideInLeft: {
        x: -100,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out'
    },
    slideInRight: {
        x: 100,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out'
    },
    slideInUp: {
        y: 100,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out'
    },
    slideInDown: {
        y: -100,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out'
    },
    scaleIn: {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)'
    },
    // Add more presets as needed
};

/**
 * Apply a preset with custom overrides
 * @param preset The preset to apply
 * @param customConfig Custom configuration to override preset values
 * @returns The combined animation configuration
 */
export const applyPreset = (
    preset: keyof typeof animationPresets,
    customConfig: Partial<AnimationConfig> = {}
): AnimationConfig => {
    return {
        ...animationPresets[preset],
        ...customConfig
    };
};

/**
 * Create a staggered animation for multiple elements
 * @param elements The elements to animate
 * @param preset The animation preset to apply
 * @param staggerAmount Time between each element's animation in seconds
 * @param customConfig Custom configuration to override preset values
 * @returns The GSAP animation instance
 */
export const staggerAnimation = async (
    elements: HTMLElement[] | NodeListOf<Element>,
    preset: keyof typeof animationPresets,
    staggerAmount = 0.1,
    customConfig: Partial<AnimationConfig> = {}
) => {
    const gsapService = GSAPService.getInstance();
    const gsap = await gsapService.loadGSAP();

    const config = applyPreset(preset, customConfig);

    return gsap.from(elements, {
        ...config,
        stagger: staggerAmount
    });
};

/**
 * Create a timeline animation
 * @param config Timeline configuration
 * @returns The GSAP timeline instance
 */
export const createTimeline = async (config = {}) => {
    const gsapService = GSAPService.getInstance();
    const gsap = await gsapService.loadGSAP();

    return gsap.timeline(config);
}; 