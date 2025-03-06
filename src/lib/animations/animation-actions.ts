/**
 * Svelte actions for GSAP animations
 * 
 * This file provides Svelte actions that can be used with the use: directive
 * to easily apply animations to elements in Svelte components.
 */

import type { Action } from 'svelte/action';
import { fadeIn, slideIn, scaleIn, applyPreset } from './animation-utils';
import type { AnimationDirection, AnimationConfig, AnimationPresetName } from './animation-types';

/**
 * Parameters for the animate action
 */
export interface AnimateActionParams {
    /**
     * The animation preset to use or a custom animation config
     */
    animation: AnimationPresetName | AnimationConfig;

    /**
     * Direction for directional animations (e.g., slideIn)
     */
    direction?: AnimationDirection;

    /**
     * Distance for animations that support it (e.g., slideIn)
     */
    distance?: number;

    /**
     * Duration of the animation in seconds
     */
    duration?: number;

    /**
     * Delay before the animation starts in seconds
     */
    delay?: number;

    /**
     * Whether to play the animation on mount
     */
    playOnMount?: boolean;

    /**
     * Custom scale for scale animations
     */
    scale?: number;
}

/**
 * Svelte action for applying GSAP animations to elements
 * 
 * Usage:
 * ```svelte
 * <div use:animate={{ animation: 'fadeIn', duration: 1, delay: 0.2 }}>
 *   Content to animate
 * </div>
 * ```
 */
export const animate: Action<HTMLElement, AnimateActionParams> = (
    element: HTMLElement,
    params: AnimateActionParams
) => {
    let animation: any;

    const playAnimation = async () => {
        if (typeof params.animation === 'string') {
            // It's a preset name
            switch (params.animation) {
                case 'fadeIn':
                    animation = await fadeIn(element, params.duration, params.delay);
                    break;
                case 'slideInLeft':
                case 'slideInRight':
                case 'slideInUp':
                case 'slideInDown':
                    const direction = params.animation === 'slideInLeft' ? 'left' :
                        params.animation === 'slideInRight' ? 'right' :
                            params.animation === 'slideInUp' ? 'top' : 'bottom';
                    animation = await slideIn(
                        element,
                        direction,
                        params.distance,
                        params.duration,
                        params.delay
                    );
                    break;
                case 'scaleIn':
                    animation = await scaleIn(
                        element,
                        params.scale,
                        params.duration,
                        params.delay
                    );
                    break;
                default:
                    // Apply a generic preset
                    const config = applyPreset(params.animation, {
                        duration: params.duration,
                        delay: params.delay
                    });
                    animation = await fadeIn(element, config.duration, config.delay);
            }
        } else {
            // It's a custom config
            const config = { ...params.animation };
            if (params.duration !== undefined) config.duration = params.duration;
            if (params.delay !== undefined) config.delay = params.delay;

            animation = await fadeIn(element, config.duration, config.delay);
        }
    };

    // Play animation on mount if requested
    if (params.playOnMount !== false) {
        playAnimation();
    }

    return {
        update: (newParams: AnimateActionParams) => {
            params = newParams;
            if (newParams.playOnMount !== false) {
                playAnimation();
            }
        },
        destroy: () => {
            // Clean up animation if needed
            if (animation && animation.kill) {
                animation.kill();
            }
        }
    };
};

/**
 * Svelte action for staggered animations on child elements
 * 
 * Usage:
 * ```svelte
 * <ul use:staggerAnimate={{ 
 *   animation: 'fadeIn', 
 *   childSelector: 'li', 
 *   staggerAmount: 0.1 
 * }}>
 *   <li>Item 1</li>
 *   <li>Item 2</li>
 *   <li>Item 3</li>
 * </ul>
 * ```
 */
export interface StaggerAnimateParams extends AnimateActionParams {
    /**
     * CSS selector for child elements to animate
     */
    childSelector: string;

    /**
     * Amount of time between each child animation
     */
    staggerAmount?: number;
}

export const staggerAnimate: Action<HTMLElement, StaggerAnimateParams> = (
    element: HTMLElement,
    params: StaggerAnimateParams
) => {
    let animation: any;

    const playAnimation = async () => {
        const children = element.querySelectorAll(params.childSelector);
        if (children.length === 0) return;

        const staggerAmount = params.staggerAmount || 0.1;
        const config = typeof params.animation === 'string'
            ? applyPreset(params.animation, {
                duration: params.duration,
                delay: params.delay
            })
            : { ...params.animation };

        // Add stagger property to the config
        config.stagger = staggerAmount;

        // Apply the animation to all children
        const gsapService = (await import('./gsap-service')).GSAPService.getInstance();
        const gsap = await gsapService.loadGSAP();

        if (config.opacity === 0) {
            // It's a "from" animation
            animation = gsap.from(children, config);
        } else {
            // It's a "to" animation
            animation = gsap.to(children, config);
        }
    };

    // Play animation on mount if requested
    if (params.playOnMount !== false) {
        playAnimation();
    }

    return {
        update: (newParams: StaggerAnimateParams) => {
            params = newParams;
            if (newParams.playOnMount !== false) {
                playAnimation();
            }
        },
        destroy: () => {
            // Clean up animation if needed
            if (animation && animation.kill) {
                animation.kill();
            }
        }
    };
}; 