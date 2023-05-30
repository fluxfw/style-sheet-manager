/** @typedef {import("../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("./ImportCss/ImportCss.mjs").ImportCss} ImportCss */

export class FluxCssApi {
    /**
     * @type {Map<string, CSSStyleSheet>}
     */
    #css;
    /**
     * @type {FluxHttpApi | null}
     */
    #flux_http_api = null;
    /**
     * @type {ImportCss | null}
     */
    #import_css = null;

    /**
     * @returns {FluxCssApi}
     */
    static new() {
        return new this();
    }

    /**
     * @private
     */
    constructor() {
        this.#css = new Map();
    }

    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet>}
     */
    async import(url) {
        let css;

        if (this.#css.has(url)) {
            css = this.#css.get(url);
        } else {
            css = (await this.#getImportCss()).import(
                url
            );

            this.#css.set(url, css);
        }

        return css;
    }

    /**
     * @returns {Promise<FluxHttpApi>}
     */
    async #getFluxHttpApi() {
        this.#flux_http_api ??= (await import("../../flux-http-api/src/FluxHttpApi.mjs")).FluxHttpApi.new();

        return this.#flux_http_api;
    }

    /**
     * @returns {Promise<ImportCss>}
     */
    async #getImportCss() {
        if (this.#import_css === null) {
            try {
                if (navigator.userAgentData?.brands?.some(brand => brand.brand === "Chromium") ?? false) {
                    this.#import_css ??= (await import("./ImportCss/AssertImportCss.mjs")).AssertImportCss.new();

                    return this.#import_css;
                }
            } catch (error) {
                console.error(error);
            }

            console.info("Unsupported assert import - Using request fallback");

            this.#import_css ??= (await import("./ImportCss/RequestImportCss.mjs")).RequestImportCss.new(
                await this.#getFluxHttpApi()
            );
        }

        return this.#import_css;
    }
}

export const flux_css_api = FluxCssApi.new();
