/**
 * Animation Types - TypeScript definitions for animations and their configurations
 */

/**
 * Types of animations supported by the animation system
 */
export type AnimationType =
    | 'fadeIn'
    | 'fadeOut'
    | 'slideIn'
    | 'slideOut'
    | 'scale'
    | 'rotate'
    | 'custom';

/**
 * Directions for animations that have directional variants
 */
export type AnimationDirection =
    | 'left'
    | 'right'
    | 'top'
    | 'bottom';

/**
 * Configuration for animations
 */
export interface AnimationConfig {
    animation?: AnimationType;
    duration?: number;
    delay?: number;
    ease?: string;
    stagger?: number;
    direction?: AnimationDirection;
    distance?: number;
    [key: string]: any;
}

/**
 * Configuration for ScrollTrigger
 */
export interface ScrollTriggerConfig {
    trigger?: HTMLElement | string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    markers?: boolean;
    toggleActions?: string;
    pin?: boolean | HTMLElement | string;
    pinSpacing?: boolean | string;
    [key: string]: any;
} 