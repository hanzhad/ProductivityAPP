/**
 * Types for Google SDK
 */
export interface GoogleSDKConfig {
  apiKey: string;
  discoveryDocs?: string[];
}

export interface GoogleSDKLoadOptions {
  timeout?: number;
  skipIfLoaded?: boolean;
}

/**
 * GoogleSDK - Handles loading and initialization of Google API scripts
 * This class manages the external Google API and Google Identity Services scripts
 */
export class GoogleSDK {
  private static readonly GAPI_SCRIPT_URL = 'https://apis.google.com/js/api.js';
  private static readonly GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
  private static readonly DEFAULT_DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  ];

  private config: GoogleSDKConfig;
  private gapiLoaded = false;
  private gisLoaded = false;
  private gapiInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(config: GoogleSDKConfig) {
    this.config = {
      ...config,
      discoveryDocs: config.discoveryDocs || GoogleSDK.DEFAULT_DISCOVERY_DOCS,
    };
  }

  /**
   * Initialize both GAPI and GIS scripts
   */
  public async initialize(options: GoogleSDKLoadOptions = {}): Promise<void> {
    // Return existing promise if initialization is in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.isInitialized() && options.skipIfLoaded !== false) {
      return Promise.resolve();
    }

    this.initPromise = this.performInitialization(options.timeout);

    try {
      await this.initPromise;
    } finally {
      this.initPromise = null;
    }
  }

  /**
   * Check if SDK is fully initialized
   */
  public isInitialized(): boolean {
    return this.gapiLoaded && this.gisLoaded && this.gapiInitialized;
  }

  /**
   * Check if GAPI is loaded
   */
  public isGapiLoaded(): boolean {
    return this.gapiLoaded && window.gapi?.client !== undefined;
  }

  /**
   * Check if GIS is loaded
   */
  public isGisLoaded(): boolean {
    return this.gisLoaded && window.google?.accounts?.oauth2 !== undefined;
  }

  /**
   * Get the GAPI client instance
   */
  public getGapiClient(): any {
    if (!this.isGapiLoaded()) {
      throw new Error('GAPI client not loaded. Call initialize() first.');
    }
    return window.gapi.client;
  }

  public getGapi() {
    if (!this.isGapiLoaded()) {
      throw new Error('GAPI client not loaded. Call initialize() first.');
    }

    return window.gapi;
  }

  /**
   * Get the GIS instance
   */
  public getGis(): any {
    if (!this.isGisLoaded()) {
      throw new Error('GIS not loaded. Call initialize() first.');
    }
    return window.google.accounts.oauth2;
  }

  /**
   * Ensure SDK is initialized before use
   */
  public async ensureInitialized(): Promise<void> {
    if (!this.isInitialized()) {
      await this.initialize();
    }
  }

  /**
   * Clean up loaded scripts (useful for testing or hot reload)
   */
  public cleanup(): void {
    // Remove scripts from DOM
    const gapiScript = document.querySelector(`script[src="${GoogleSDK.GAPI_SCRIPT_URL}"]`);
    const gisScript = document.querySelector(`script[src="${GoogleSDK.GIS_SCRIPT_URL}"]`);

    gapiScript?.remove();
    gisScript?.remove();

    // Reset state
    this.gapiLoaded = false;
    this.gisLoaded = false;
    this.gapiInitialized = false;
    this.initPromise = null;
  }

  /**
   * Perform the actual initialization
   */
  private async performInitialization(timeout?: number): Promise<void> {
    const initPromise = Promise.all([this.loadGapiScript(), this.loadGisScript()]);

    // Add timeout if specified
    if (timeout) {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`SDK initialization timeout after ${timeout}ms`)),
          timeout
        );
      });

      await Promise.race([initPromise, timeoutPromise]);
    } else {
      await initPromise;
    }
  }

  /**
   * Load the Google API (gapi) script
   */
  private async loadGapiScript(): Promise<void> {
    // Check if already loaded
    if (this.gapiLoaded && window.gapi) {
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector(`script[src="${GoogleSDK.GAPI_SCRIPT_URL}"]`);

    if (existingScript && window.gapi) {
      this.gapiLoaded = true;
      await this.initializeGapiClient();
      return;
    }

    // Load the script
    await this.loadScript(GoogleSDK.GAPI_SCRIPT_URL, 'gapi');
    this.gapiLoaded = true;

    // Initialize the gapi client
    await this.initializeGapiClient();
  }

  /**
   * Initialize the gapi client with API key and discovery docs
   */
  private async initializeGapiClient(): Promise<void> {
    if (this.gapiInitialized || !window.gapi) {
      return;
    }

    return new Promise((resolve, reject) => {
      window.gapi.load('client', async () => {
        try {
          // Initialize without clientId - OAuth will be handled by GIS
          await window.gapi.client.init({
            apiKey: this.config.apiKey,
            discoveryDocs: this.config.discoveryDocs,
          });

          // Load the calendar API explicitly
          await window.gapi.client.load('calendar', 'v3');

          this.gapiInitialized = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Load the Google Identity Services (GIS) script
   */
  private async loadGisScript(): Promise<void> {
    // Check if already loaded
    if (this.gisLoaded && window.google?.accounts?.oauth2) {
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector(`script[src="${GoogleSDK.GIS_SCRIPT_URL}"]`);

    if (existingScript && window.google?.accounts?.oauth2) {
      this.gisLoaded = true;
      return;
    }

    // Load the script
    await this.loadScript(GoogleSDK.GIS_SCRIPT_URL, 'gis');
    this.gisLoaded = true;
  }

  /**
   * Generic script loader
   */
  private loadScript(src: string, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        resolve();
      };

      script.onerror = (error) => {
        const errorMessage = `Failed to load ${name} script from ${src}`;
        reject(new Error(errorMessage));
      };

      document.body.appendChild(script);
    });
  }
}

// Global type declarations
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}
