/**
 * GSAPService - A singleton service for managing GSAP instances and plugins
 * 
 * This service provides centralized management of GSAP and its plugins,
 * with proper lazy loading and memory management.
 */

export class GSAPService {
    private static instance: GSAPService;
    private gsapInstance: any = null;
    private plugins: Map<string, any> = new Map();
    private contexts: Map<string, any> = new Map();

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() { }

    /**
     * Get the singleton instance of GSAPService
     */
    public static getInstance(): GSAPService {
        if (!GSAPService.instance) {
            GSAPService.instance = new GSAPService();
        }
        return GSAPService.instance;
    }

    /**
     * Load GSAP asynchronously
     * @returns The GSAP instance
     */
    public async loadGSAP(): Promise<any> {
        if (!this.gsapInstance) {
            const gsap = await import('gsap');
            this.gsapInstance = gsap.default;
        }
        return this.gsapInstance;
    }

    /**
     * Get the GSAP instance synchronously (may be null if not loaded)
     * @returns The GSAP instance or null
     */
    public getGSAPSync(): any {
        return this.gsapInstance;
    }

    /**
     * Load a GSAP plugin asynchronously
     * @param pluginName The name of the plugin to load
     * @returns The plugin instance
     */
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

    /**
     * Create a GSAP context for managing animations
     * @param id A unique identifier for the context
     * @returns The GSAP context
     */
    public createContext(id: string): any {
        const gsap = this.getGSAPSync();
        if (!gsap) return null;

        const context = gsap.context(() => { });
        this.contexts.set(id, context);

        return context;
    }

    /**
     * Clear a GSAP context and clean up its animations
     * @param id The identifier of the context to clear
     */
    public clearContext(id: string): void {
        const context = this.contexts.get(id);
        if (context) {
            context.revert(); // Clean up all animations in this context
            this.contexts.delete(id);
        }
    }

    /**
     * Clear all GSAP contexts and clean up all animations
     */
    public clearAllContexts(): void {
        this.contexts.forEach((context, id) => {
            this.clearContext(id);
        });
    }

    /**
     * Reset the service (for testing purposes)
     */
    public static resetInstance(): void {
        if (GSAPService.instance) {
            GSAPService.instance.clearAllContexts();
            GSAPService.instance = null as any;
        }
    }
} 