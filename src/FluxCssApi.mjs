/** @typedef {import("../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("./ImportCss/ImportCss.mjs").ImportCss} ImportCss */

export class FluxCssApi {
    /**
     * @type {Map<CSSStyleSheet | HTMLStyleElement>}
     */
    #cache;
    /**
     * @type {FluxHttpApi}
     */
    #flux_http_api;
    /**
     * @type {ImportCss | null}
     */
    #import_css = null;

    /**
     * @param {FluxHttpApi} flux_http_api
     * @returns {FluxCssApi}
     */
    static new(flux_http_api) {
        return new this(
            flux_http_api
        );
    }

    /**
     * @param {FluxHttpApi} flux_http_api
     * @private
     */
    constructor(flux_http_api) {
        this.#flux_http_api = flux_http_api;
        this.#cache = new Map();
    }

    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet | HTMLStyleElement>}
     */
    async importCss(url) {
        return (await this.#getImportCss()).importCss(
            url
        );
    }

    /**
     * @param {ShadowRoot | Document} root
     * @param {string} url
     * @returns {void}
     */
    importCssToRoot(root, url) {
        if (this.#cache.has(url)) {
            this.#adopt(
                root,
                this.#cache.get(url)
            );
        } else {
            this.importCss(
                url
            ).then(sheet => {
                this.#cache.set(url, sheet);

                this.#adopt(
                    root,
                    sheet
                );
            }).catch(error => {
                console.error(`Import css ${url} failed (`, error, ")");
            });
        }
    }

    /**
     * @param {ShadowRoot | Document} root
     * @param {CSSStyleSheet | HTMLStyleElement} sheet
     * @returns {void}
     */
    #adopt(root, sheet) {
        if (sheet instanceof HTMLStyleElement) {
            const cloned_sheet = sheet.cloneNode(true);

            if (root instanceof Document) {
                root.head.appendChild(cloned_sheet);
            } else {
                root.prepend(cloned_sheet);
            }
        } else {
            try {
                root.adoptedStyleSheets.push(sheet);
            } catch (error) {
                console.error("Unsupported adoptedStyleSheets - No fallback possible in this context (", error, ")");
            }
        }
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
                this.#cache,
                this.#flux_http_api
            );
        }

        return this.#import_css;
    }
}
