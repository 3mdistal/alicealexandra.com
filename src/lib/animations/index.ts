/**
 * Animation System Index
 * 
 * This file exports all components of the animation system for easier imports.
 */

// Core services
export { GSAPService } from './gsap-service';

// Animation utilities
export {
    fadeIn,
    fadeOut,
    slideIn,
    scaleIn,
    animationPresets,
    applyPreset,
    staggerAnimation,
    createTimeline
} from './animation-utils';

// Svelte actions
export {
    animate,
    staggerAnimate,
    type AnimateActionParams,
    type StaggerAnimateParams
} from './animation-actions';

// Types
export type {
    AnimationDirection,
    AnimationConfig,
    AnimationPresetName
} from './animation-types'; 