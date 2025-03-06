import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GSAPService } from './gsap-service';

// Mock GSAP and ScrollTrigger
vi.mock('gsap', () => {
    const mockGsap = {
        default: {
            registerPlugin: vi.fn(),
            context: vi.fn(() => ({
                revert: vi.fn()
            }))
        }
    };
    return mockGsap;
});

vi.mock('gsap/dist/ScrollTrigger', () => {
    return {
        ScrollTrigger: { name: 'ScrollTrigger' }
    };
});

describe('GSAPService', () => {
    beforeEach(() => {
        // Reset the service before each test
        GSAPService.resetInstance();
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Clean up after each test
        GSAPService.resetInstance();
    });

    it('should be a singleton', () => {
        const instance1 = GSAPService.getInstance();
        const instance2 = GSAPService.getInstance();

        expect(instance1).toBe(instance2);
    });

    it('should load GSAP asynchronously', async () => {
        const service = GSAPService.getInstance();
        const gsap = await service.loadGSAP();

        expect(gsap).toBeDefined();
        expect(gsap.registerPlugin).toBeDefined();
    });

    it('should return null for getGSAPSync if GSAP is not loaded', () => {
        const service = GSAPService.getInstance();
        const gsap = service.getGSAPSync();

        expect(gsap).toBeNull();
    });

    it('should return GSAP instance for getGSAPSync after loading', async () => {
        const service = GSAPService.getInstance();
        await service.loadGSAP();
        const gsap = service.getGSAPSync();

        expect(gsap).toBeDefined();
        expect(gsap.registerPlugin).toBeDefined();
    });

    it('should load and register ScrollTrigger plugin', async () => {
        const service = GSAPService.getInstance();
        const gsap = await service.loadGSAP();
        const scrollTrigger = await service.loadPlugin('ScrollTrigger');

        expect(scrollTrigger).toBeDefined();
        expect(scrollTrigger.name).toBe('ScrollTrigger');
        expect(gsap.registerPlugin).toHaveBeenCalledWith(scrollTrigger);
    });

    it('should throw error for unknown plugin', async () => {
        const service = GSAPService.getInstance();
        await service.loadGSAP();

        await expect(service.loadPlugin('UnknownPlugin')).rejects.toThrow('Unknown plugin: UnknownPlugin');
    });

    it('should create and store context', async () => {
        const service = GSAPService.getInstance();
        await service.loadGSAP();

        const context = service.createContext('test-context');

        expect(context).toBeDefined();
        expect(context.revert).toBeDefined();
    });

    it('should return null from createContext if GSAP is not loaded', () => {
        const service = GSAPService.getInstance();
        const context = service.createContext('test-context');

        expect(context).toBeNull();
    });

    it('should clear context', async () => {
        const service = GSAPService.getInstance();
        await service.loadGSAP();

        const gsap = service.getGSAPSync();
        const contextMock = {
            revert: vi.fn()
        };
        gsap.context.mockReturnValueOnce(contextMock);

        service.createContext('test-context');
        service.clearContext('test-context');

        expect(contextMock.revert).toHaveBeenCalled();
    });

    it('should clear all contexts', async () => {
        const service = GSAPService.getInstance();
        await service.loadGSAP();

        const gsap = service.getGSAPSync();
        const contextMock1 = {
            revert: vi.fn()
        };
        const contextMock2 = {
            revert: vi.fn()
        };
        gsap.context.mockReturnValueOnce(contextMock1);
        gsap.context.mockReturnValueOnce(contextMock2);

        service.createContext('test-context-1');
        service.createContext('test-context-2');
        service.clearAllContexts();

        expect(contextMock1.revert).toHaveBeenCalled();
        expect(contextMock2.revert).toHaveBeenCalled();
    });

    it('should reset the instance', async () => {
        const service1 = GSAPService.getInstance();
        await service1.loadGSAP();

        GSAPService.resetInstance();

        const service2 = GSAPService.getInstance();
        expect(service2).not.toBe(service1);
        expect(service2.getGSAPSync()).toBeNull();
    });
}); 