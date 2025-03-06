# GSAP Architecture Proposal for alicealexandra.com

## Executive Summary

This document proposes a comprehensive architecture for improving the implementation of GSAP animations in the alicealexandra.com codebase. The goal is to create a more consistent, reliable, and maintainable animation system while preserving the high-quality animations that are central to the site's user experience.

## Current State Analysis

Based on an analysis of the codebase, GSAP is currently:

- Used in at least 13 files across the project
- Implementing various animation types (timelines, direct animations)
- Using the ScrollTrigger plugin for scroll-based animations
- Dynamically loaded in some cases (via load-scroll-trigger.ts)
- Listed as a devDependency in package.json (version ^3.12.7)

### Current Issues

1. **Inconsistent Implementation**: Different components use GSAP in different ways
2. **Duplicate Animation Logic**: Similar animations are reimplemented across components
3. **No Centralized Management**: No central service for managing GSAP instances and plugins
4. **Limited Type Safety**: Incomplete TypeScript definitions for animations
5. **Potential Performance Issues**: No standardized approach to animation cleanup and memory management
6. **Tight Coupling**: Animation logic is tightly coupled with component logic

## Proposed Architecture

### Core Principles

1. **Centralization**: Unified animation system for configuration and initialization
2. **Modularity**: Composable animation modules that can be reused
3. **Lazy Loading**: Proper code splitting for reduced initial bundle size
4. **Type Safety**: Comprehensive TypeScript definitions
5. **Performance Optimization**: Best practices for GSAP performance
6. **Consistent Patterns**: Standardized approaches to animations
7. **Separation of Concerns**: Decoupling animation logic from component logic
8. **Testing Support**: Making animations testable and disableable

### Architecture Components

#### 1. Core Services

##### GSAPService

A singleton service for managing GSAP instances and plugins:

```typescript
// src/lib/animations/gsap-service.ts
export class GSAPService {
  private static instance: GSAPService;
  private gsapInstance: any = null;
  private plugins: Map<string, any> = new Map();
  private contexts: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): GSAPService {
    if (!GSAPService.instance) {
      GSAPService.instance = new GSAPService();
    }
    return GSAPService.instance;
  }

  public async loadGSAP(): Promise<any> {
    if (!this.gsapInstance) {
      const gsap = await import('gsap');
      this.gsapInstance = gsap.default;
    }
    return this.gsapInstance;
  }

  public getGSAPSync(): any {
    return this.gsapInstance;
  }

  public async loadPlugin(pluginName: string): Promise<any> {
    if (this.plugins.has(pluginName)) {
      return this.plugins.get(pluginName);
    }

    let plugin;
    switch (pluginName) {
      case 'ScrollTrigger':
        const module = await import('gsap/dist/ScrollTrigger');
        plugin = module.ScrollTrigger;
        break;
      // Add other plugins as needed
      default:
        throw new Error(`Unknown plugin: ${pluginName}`);
    }

    const gsap = await this.loadGSAP();
    gsap.registerPlugin(plugin);
    this.plugins.set(pluginName, plugin);
    
    return plugin;
  }

  public createContext(id: string): any {
    const gsap = this.getGSAPSync();
    if (!gsap) return null;
    
    const context = gsap.context(() => {});
    this.contexts.set(id, context);
    
    return context;
  }

  public clearContext(id: string): void {
    const context = this.contexts.get(id);
    if (context) {
      context.revert(); // Clean up all animations in this context
      this.contexts.delete(id);
    }
  }

  public clearAllContexts(): void {
    this.contexts.forEach((context, id) => {
      this.clearContext(id);
    });
  }
}
```

##### ScrollTriggerService

A dedicated service for ScrollTrigger functionality:

```typescript
// src/lib/animations/scroll-trigger-service.ts
import type { ScrollTriggerConfig, AnimationConfig } from './animation-types';
import { GSAPService } from './gsap-service';

export class ScrollTriggerService {
  private static instance: ScrollTriggerService;
  private scrollTriggerInstance: any = null;
  private observers: Map<string, { element: HTMLElement, config: ScrollTriggerConfig, animation: any }> = new Map();
  
  private constructor() {}
  
  public static getInstance(): ScrollTriggerService {
    if (!ScrollTriggerService.instance) {
      ScrollTriggerService.instance = new ScrollTriggerService();
    }
    return ScrollTriggerService.instance;
  }
  
  public async loadScrollTrigger(): Promise<any> {
    if (!this.scrollTriggerInstance) {
      const gsapService = GSAPService.getInstance();
      const ScrollTrigger = await gsapService.loadPlugin('ScrollTrigger');
      this.scrollTriggerInstance = ScrollTrigger;
    }
    
    return this.scrollTriggerInstance;
  }
  
  public async createScrollAnimation(
    element: HTMLElement,
    animationConfig: AnimationConfig,
    scrollConfig: ScrollTriggerConfig,
    id: string
  ): Promise<any> {
    const gsapService = GSAPService.getInstance();
    const gsap = await gsapService.loadGSAP();
    await this.loadScrollTrigger();
    
    // Clean up any existing animation with the same ID
    this.removeScrollAnimation(id);
    
    // Create the animation with ScrollTrigger
    const animation = gsap.to(element, {
      ...animationConfig,
      scrollTrigger: {
        trigger: scrollConfig.trigger || element,
        start: scrollConfig.start || 'top bottom',
        end: scrollConfig.end || 'bottom top',
        scrub: scrollConfig.scrub !== undefined ? scrollConfig.scrub : false,
        markers: scrollConfig.markers || false,
        toggleActions: scrollConfig.toggleActions || 'play none none none',
        ...scrollConfig
      }
    });
    
    // Store the observer for later cleanup
    this.observers.set(id, {
      element,
      config: scrollConfig,
      animation
    });
    
    return animation;
  }
  
  public removeScrollAnimation(id: string): void {
    const observer = this.observers.get(id);
    
    if (observer) {
      observer.animation.kill();
      this.observers.delete(id);
    }
  }
  
  public refreshAll(): void {
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.refresh();
    }
  }
  
  public clearAll(): void {
    this.observers.forEach((observer, id) => {
      this.removeScrollAnimation(id);
    });
  }
}
```

#### 2. Animation Utilities and Presets

```typescript
// src/lib/animations/animation-utils.ts
import { GSAPService } from './gsap-service';

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

export const slideIn = async (element: HTMLElement, direction = 'left', distance = 100, duration = 0.5) => {
  const gsapService = GSAPService.getInstance();
  const gsap = await gsapService.loadGSAP();
  
  const x = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
  const y = direction === 'top' ? -distance : direction === 'bottom' ? distance : 0;
  
  return gsap.from(element, {
    x,
    y,
    opacity: 0,
    duration,
    ease: 'power2.out'
  });
};

// Animation presets for standardization
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

// Helper function to apply presets
export const applyPreset = (preset: keyof typeof animationPresets, customConfig = {}) => {
  return {
    ...animationPresets[preset],
    ...customConfig
  };
};
```

#### 3. Animation Types

```typescript
// src/lib/animations/animation-types.ts
export type AnimationType = 
  | 'fadeIn' 
  | 'fadeOut' 
  | 'slideIn' 
  | 'slideOut' 
  | 'scale' 
  | 'rotate' 
  | 'custom';

export type AnimationDirection = 
  | 'left' 
  | 'right' 
  | 'top' 
  | 'bottom';

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
```

#### 4. Svelte Actions for Animations

```typescript
// src/lib/animations/animation-actions.ts
import { GSAPService } from './gsap-service';
import { ScrollTriggerService } from './scroll-trigger-service';
import type { AnimationConfig, ScrollTriggerConfig } from './animation-types';
import { animationPresets } from './animation-utils';

export function animate(
  node: HTMLElement,
  params: {
    animation: string;
    duration?: number;
    delay?: number;
    ease?: string;
    [key: string]: any;
  }
) {
  const gsapService = GSAPService.getInstance();
  let animation: any = null;
  const contextId = `animate-${Math.random().toString(36).substring(2, 9)}`;

  const setupAnimation = async () => {
    const gsap = await gsapService.loadGSAP();
    
    // Clean up any existing animation
    if (animation) {
      animation.kill();
    }
    
    // Apply the animation based on the type
    if (params.animation in animationPresets) {
      const preset = animationPresets[params.animation as keyof typeof animationPresets];
      animation = gsap.from(node, {
        ...preset,
        duration: params.duration || preset.duration,
        delay: params.delay || 0,
        ease: params.ease || preset.ease,
        ...params
      });
    } else {
      // Custom animation
      animation = gsap.from(node, {
        opacity: 0,
        duration: params.duration || 0.5,
        delay: params.delay || 0,
        ease: params.ease || 'power2.out',
        ...params
      });
    }
  };

  setupAnimation();

  return {
    update(newParams: any) {
      params = newParams;
      setupAnimation();
    },
    destroy() {
      if (animation) {
        animation.kill();
      }
      gsapService.clearContext(contextId);
    }
  };
}

export function scrollAnimate(
  node: HTMLElement,
  params: {
    animation: string;
    scrollTrigger: ScrollTriggerConfig;
    [key: string]: any;
  }
) {
  const scrollTriggerService = ScrollTriggerService.getInstance();
  let animation: any = null;
  const id = `scroll-animate-${Math.random().toString(36).substring(2, 9)}`;

  const setupAnimation = async () => {
    // Get animation config
    let animationConfig: AnimationConfig = {};
    
    if (params.animation in animationPresets) {
      const preset = animationPresets[params.animation as keyof typeof animationPresets];
      animationConfig = {
        ...preset,
        ...params
      };
    } else {
      // Custom animation
      animationConfig = {
        opacity: 0,
        duration: params.duration || 0.5,
        ease: params.ease || 'power2.out',
        ...params
      };
    }
    
    // Create scroll animation
    animation = await scrollTriggerService.createScrollAnimation(
      node,
      animationConfig,
      params.scrollTrigger,
      id
    );
  };

  setupAnimation();

  return {
    update(newParams: any) {
      params = newParams;
      setupAnimation();
    },
    destroy() {
      scrollTriggerService.removeScrollAnimation(id);
    }
  };
}
```

#### 5. Animation Components

```svelte
<!-- src/lib/animations/AnimatedElement.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { GSAPService } from './gsap-service';
  import { ScrollTriggerService } from './scroll-trigger-service';
  import { animationPresets } from './animation-utils';
  import type { ScrollTriggerConfig } from './animation-types';
  
  export let animation: string = 'fadeIn';
  export let duration: number | undefined = undefined;
  export let delay: number = 0;
  export let ease: string | undefined = undefined;
  export let stagger: number | null = null;
  
  // ScrollTrigger props
  export let useScrollTrigger: boolean = false;
  export let scrollTrigger: ScrollTriggerConfig = {};
  
  let element: HTMLElement;
  let animationInstance: any;
  let contextId = `animated-element-${Math.random().toString(36).substring(2, 9)}`;
  
  onMount(async () => {
    if (useScrollTrigger) {
      await setupScrollAnimation();
    } else {
      await setupAnimation();
    }
  });
  
  const setupAnimation = async () => {
    const gsapService = GSAPService.getInstance();
    const gsap = await gsapService.loadGSAP();
    
    // Clean up any existing animation
    if (animationInstance) {
      animationInstance.kill();
    }
    
    // Get animation config from presets or create custom
    let animationConfig = {};
    
    if (animation in animationPresets) {
      const preset = animationPresets[animation as keyof typeof animationPresets];
      animationConfig = {
        ...preset,
        duration: duration !== undefined ? duration : preset.duration,
        ease: ease || preset.ease,
        delay
      };
    } else {
      // Custom animation
      animationConfig = {
        opacity: 0,
        duration: duration || 0.5,
        delay,
        ease: ease || 'power2.out'
      };
    }
    
    // Apply animation
    animationInstance = gsap.from(element, animationConfig);
  };
  
  const setupScrollAnimation = async () => {
    const scrollTriggerService = ScrollTriggerService.getInstance();
    
    // Get animation config from presets or create custom
    let animationConfig = {};
    
    if (animation in animationPresets) {
      const preset = animationPresets[animation as keyof typeof animationPresets];
      animationConfig = {
        ...preset,
        duration: duration !== undefined ? duration : preset.duration,
        ease: ease || preset.ease
      };
    } else {
      // Custom animation
      animationConfig = {
        opacity: 0,
        duration: duration || 0.5,
        ease: ease || 'power2.out'
      };
    }
    
    // Create scroll animation
    animationInstance = await scrollTriggerService.createScrollAnimation(
      element,
      animationConfig,
      {
        trigger: scrollTrigger.trigger || element,
        start: scrollTrigger.start || 'top bottom',
        end: scrollTrigger.end || 'bottom top',
        scrub: scrollTrigger.scrub !== undefined ? scrollTrigger.scrub : false,
        markers: scrollTrigger.markers || false,
        ...scrollTrigger
      },
      contextId
    );
  };
  
  onDestroy(() => {
    if (animationInstance) {
      animationInstance.kill();
    }
    
    if (useScrollTrigger) {
      const scrollTriggerService = ScrollTriggerService.getInstance();
      scrollTriggerService.removeScrollAnimation(contextId);
    } else {
      const gsapService = GSAPService.getInstance();
      gsapService.clearContext(contextId);
    }
  });
</script>

<div bind:this={element}>
  <slot />
</div>
```

#### 6. Animation Stores

```typescript
// src/lib/animations/animation-store.ts
import { writable } from 'svelte/store';

export const createAnimationStore = () => {
  const { subscribe, set, update } = writable({
    isAnimating: false,
    progress: 0,
    direction: 'forward'
  });

  return {
    subscribe,
    start: () => update(state => ({ ...state, isAnimating: true })),
    complete: () => update(state => ({ ...state, isAnimating: false, progress: 1 })),
    updateProgress: (progress: number) => update(state => ({ ...state, progress })),
    setDirection: (direction: 'forward' | 'backward') => update(state => ({ ...state, direction })),
    reset: () => set({ isAnimating: false, progress: 0, direction: 'forward' })
  };
};
```

#### 7. Compatibility Layer

```typescript
// src/lib/animations/compat.ts
import { GSAPService } from './gsap-service';
import { ScrollTriggerService } from './scroll-trigger-service';

// Compatibility layer for existing code
export const compatGSAP = {
  async getGSAP() {
    const gsapService = GSAPService.getInstance();
    return await gsapService.loadGSAP();
  },
  
  async getScrollTrigger() {
    const scrollTriggerService = ScrollTriggerService.getInstance();
    return await scrollTriggerService.loadScrollTrigger();
  },
  
  // Legacy methods to help with migration
  async createTimeline(config = {}) {
    const gsap = await this.getGSAP();
    return gsap.timeline(config);
  },
  
  async to(targets, config) {
    const gsap = await this.getGSAP();
    return gsap.to(targets, config);
  },
  
  async from(targets, config) {
    const gsap = await this.getGSAP();
    return gsap.from(targets, config);
  }
};
```

## Performance Optimization

### Lazy Loading

The architecture implements lazy loading of GSAP and its plugins, reducing the initial bundle size and improving page load performance.

### Memory Management

The architecture includes proper cleanup of animations and contexts, preventing memory leaks and improving overall performance.

### Animation Batching

Where possible, animations are batched to reduce the number of style recalculations and improve performance.

### Context-Based Animations

The architecture uses GSAP's context feature for better memory management and cleanup.

## Migration Strategy

### Phase 1: Core Infrastructure

1. Implement the core services (GSAPService, ScrollTriggerService)
2. Create animation utilities and presets
3. Define TypeScript types for animations

### Phase 2: Integration Components

1. Implement Svelte actions for animations
2. Create reusable animation components
3. Implement animation stores

### Phase 3: Migration

1. Create compatibility layer for existing code
2. Gradually migrate existing components to use the new architecture
3. Update documentation and provide examples

### Phase 4: Optimization

1. Implement performance optimizations
2. Refine the architecture based on feedback
3. Remove compatibility layer when migration is complete

## Usage Examples

### Basic Animation

```svelte
<script>
  import { animate } from '$lib/animations/animation-actions';
</script>

<div use:animate={{ animation: 'fadeIn', duration: 0.7 }}>
  This content will fade in
</div>
```

### Scroll-Triggered Animation

```svelte
<script>
  import { scrollAnimate } from '$lib/animations/animation-actions';
</script>

<div use:scrollAnimate={{
  animation: 'slideInLeft',
  scrollTrigger: {
    start: 'top bottom',
    end: 'bottom top',
    scrub: true
  }
}}>
  This content will slide in from the left as you scroll
</div>
```

### Using Animation Components

```svelte
<script>
  import AnimatedElement from '$lib/animations/AnimatedElement.svelte';
</script>

<AnimatedElement animation="fadeIn" duration={0.5} delay={0.2}>
  <h1>This heading will fade in</h1>
</AnimatedElement>

<AnimatedElement
  animation="slideInUp"
  useScrollTrigger={true}
  scrollTrigger={{ scrub: true }}
>
  <p>This paragraph will slide up as you scroll</p>
</AnimatedElement>
```

### Using Animation Presets

```typescript
import { applyPreset } from '$lib/animations/animation-utils';

// Apply a preset with custom overrides
const animationConfig = applyPreset('slideInLeft', { duration: 1, delay: 0.5 });
```

## Conclusion

This architecture provides a comprehensive solution for improving the GSAP implementation in the alicealexandra.com codebase. By centralizing animation logic, standardizing patterns, and implementing best practices, the architecture will make animations more maintainable, performant, and consistent across the application.

The phased migration approach ensures that existing functionality can be preserved while gradually adopting the new architecture, minimizing disruption to the development process. 