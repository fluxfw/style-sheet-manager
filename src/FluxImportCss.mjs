/** @typedef {import("./ImportCss/ImportCss.mjs").ImportCss} ImportCss */

/**
 * @deprecated
 */
export class FluxImportCss {
    /**
     * @type {Map<string, CSSStyleSheet>}
     * @deprecated
     */
    #css;
    /**
     * @type {ImportCss | null}
     * @deprecated
     */
    #import_css = null;

    /**
     * @returns {Promise<FluxImportCss>}
     * @deprecated
     */
    static async new() {
        return new this();
    }

    /**
     * @private
     * @deprecated
     */
    constructor() {
        this.#css = new Map();
    }

    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet>}
     * @deprecated
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
     * @returns {Promise<ImportCss>}
     * @deprecated
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

            console.info("Unsupported assert import - Using fallback");

            this.#import_css ??= (await import("./ImportCss/FallbackImportCss.mjs")).FallbackImportCss.new();
        }

        return this.#import_css;
    }
}

/**
 * @deprecated
 */
export const flux_import_css = await FluxImportCss.new();
