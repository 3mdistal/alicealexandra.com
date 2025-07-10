declare module 'gsap/dist/ScrollTrigger' {
	export interface ScrollTriggerInstance {
		refresh(): void;
		kill(): void;
		enable(): void;
		disable(): void;
		getVelocity(): number;
		progress: number;
		isActive: boolean;
		direction: number;
	}

	export interface ScrollTriggerStatic {
		create(config: ScrollTriggerConfig): ScrollTriggerInstance;
		refresh(): void;
		update(): void;
		addEventListener(type: string, callback: Function): void;
		removeEventListener(type: string, callback: Function): void;
		batch(targets: string | Element[], config: ScrollTriggerConfig): ScrollTriggerInstance[];
	}

	export interface ScrollTriggerConfig {
		trigger?: string | Element;
		start?: string | number | Function;
		end?: string | number | Function;
		scroller?: string | Element;
		pin?: boolean | string | Element;
		pinType?: 'fixed' | 'transform';
		scrub?: boolean | number;
		snap?: boolean | object;
		markers?: boolean | object;
		onEnter?: (self: ScrollTriggerInstance) => void;
		onLeave?: (self: ScrollTriggerInstance) => void;
		onEnterBack?: (self: ScrollTriggerInstance) => void;
		onLeaveBack?: (self: ScrollTriggerInstance) => void;
		onUpdate?: (self: ScrollTriggerInstance) => void;
		onToggle?: (self: ScrollTriggerInstance) => void;
		onRefresh?: (self: ScrollTriggerInstance) => void;
		toggleActions?: string;
		toggleClass?: string | object;
		anticipatePin?: number;
		fastScrollEnd?: boolean;
		preventOverlaps?: boolean | string;
		refreshPriority?: number;
		invalidateOnRefresh?: boolean;
	}

	export const ScrollTrigger: ScrollTriggerStatic;
}
