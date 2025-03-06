# GSAP Timeline Issues in Svelte 5 with Runes

## Overview

This document summarizes the challenges we encountered when attempting to implement GSAP timelines in a Svelte 5 component using the new runes syntax. Despite multiple approaches and troubleshooting efforts, we were unable to achieve consistent, reliable timeline animations.

## Issues Encountered

### 1. Double Animation Playback

When converting from `onMount` to `$effect` with runes, the timeline animations would play twice:
- Once immediately and simultaneously upon page load
- Again in sequence when explicitly triggered

This appeared to be related to how `$effect` interacts with reactive dependencies and how GSAP timelines initialize.

### 2. Jagged/Inconsistent Animation Timing

Timeline animations appeared "jagged" or inconsistent when played on initial page load:
- Stagger timing between animations was inconsistent
- Animations weren't as smooth as when manually triggered
- The same timeline would play perfectly when triggered by a button click

**Important Note:** This "jagged" animation issue was present even with the original `onMount` implementation and wasn't introduced by the switch to runes. The issue appears to be related to how GSAP timelines initialize and play during the initial page load, regardless of the component lifecycle method used.

### 3. Elements Disappearing After Animation

After timeline animations completed:
- The first box would sometimes disappear
- This only happened on page refresh, not on subsequent manual plays
- Attempts to manually reset element states had mixed results

### 4. Unpredictable Behavior with Configuration Changes

Small changes to the timeline configuration would cause significant differences in behavior:
- Adding `paused: true` sometimes prevented animations from playing at all
- Using absolute vs. relative timing positions (`0.2` vs. `-=0.3`) affected animation consistency
- Delays and timeouts sometimes helped but were inconsistent across browsers/refreshes

## Approaches Tried

1. **Promise.all vs. Sequential Creation**
   - Both approaches had issues with timing and consistency
   - Sequential creation seemed more reliable but still had problems

2. **Timeline Configuration Options**
   - Various combinations of `autoplay`, `paused`, `smoothChildTiming`, etc.
   - None provided consistent results across all scenarios

3. **Timing and Delays**
   - Added delays before timeline creation
   - Added delays before first playback
   - Used `requestAnimationFrame` for better browser rendering sync
   - Results were inconsistent

4. **Manual State Management**
   - Tracked animation readiness with state variables
   - Manually reset element states after animation
   - Added event callbacks for animation completion
   - Still encountered issues with element visibility

5. **Absolute vs. Relative Timing**
   - Tried both approaches for positioning animations in the timeline
   - Neither provided consistently smooth results

## Conclusions

1. **Runes and GSAP Timeline Compatibility**
   - While some issues were specific to runes, the core "jagged" animation problem existed with both `onMount` and `$effect`
   - The lifecycle differences between `onMount` and `$effect` primarily affected the double-playback issue, not the animation quality

2. **Complexity vs. Reliability**
   - Simpler approaches (individual animations with delays) proved more reliable than complex timeline orchestration
   - The Svelte action-based animations worked consistently throughout testing

3. **Recommended Alternatives**
   - Use individual animations with manual delays for simple sequences
   - Use Svelte actions for most animation needs
   - If timelines are absolutely necessary, consider using them outside the reactive system or with careful isolation

## Next Steps

For now, we're moving away from GSAP timelines in our Svelte 5 components and will:
1. Use individual animations with manual delays
2. Continue using the reliable Svelte action-based animations
3. Revisit timeline implementation when Svelte 5 is more mature or when clear patterns emerge from the community

This decision allows us to maintain animation quality and reliability while avoiding the unpredictable behavior we encountered with timelines. 