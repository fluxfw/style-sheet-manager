/** @typedef {import("../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("./ImportCss/ImportCss.mjs").ImportCss} ImportCss */

export class FluxCssApi {
    /**
     * @type {Map<CSSStyleSheet | HTMLStyleElement>}
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
     * @param {ShadowRoot | Document} element
     * @param {CSSStyleSheet | HTMLStyleElement} css
     * @param {boolean | null} prepend
     * @returns {void}
     */
    adopt(element, css, prepend = null) {
        if (css instanceof HTMLStyleElement) {
            const cloned_css = css.cloneNode(true);

            if (element instanceof Document) {
                let first_css;
                if ((prepend ?? false) && (first_css = element.head.querySelector(css.tagName)) !== null) {
                    element.head.insertBefore(cloned_css, first_css);
                } else {
                    element.head.appendChild(cloned_css);
                }
            } else {
                if (prepend ?? false) {
                    element.insertBefore(cloned_css, element.querySelector(css.tagName));
                } else {
                    element.prepend(cloned_css);
                }
            }
        } else {
            try {
                element.adoptedStyleSheets[prepend ?? false ? "unshift" : "push"](css);
            } catch (error) {
                console.error("Unsupported adoptedStyleSheets - No fallback possible in this context (", error, ")");
            }
        }
    }

    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet | HTMLStyleElement>}
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

            console.info("Unsupported assert import - Using fetch fallback");

            this.#import_css ??= (await import("./ImportCss/FetchImportCss.mjs")).FetchImportCss.new(
                await this.#getFluxHttpApi()
            );
        }

        return this.#import_css;
    }
}

export const flux_css_api = FluxCssApi.new();
