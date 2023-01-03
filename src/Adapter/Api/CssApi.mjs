import { CssCache } from "../Cache/CssCache.mjs";

/** @typedef {import("../../Service/Css/Port/CssService.mjs").CssService} CssService */
/** @typedef {import("../../../../flux-http-api/src/Adapter/Api/HttpApi.mjs").HttpApi} HttpApi */
/** @typedef {import("../ImportCss/ImportCss.mjs").ImportCss} ImportCss */

export class CssApi {
    /**
     * @type {CssCache}
     */
    #css_cache;
    /**
     * @type {CssService | null}
     */
    #css_service = null;
    /**
     * @type {HttpApi}
     */
    #http_api;
    /**
     * @type {ImportCss | null}
     */
    #import_css = null;

    /**
     * @param {HttpApi} http_api
     * @returns {CssApi}
     */
    static new(http_api) {
        return new this(
            http_api
        );
    }

    /**
     * @param {HttpApi} http_api
     * @private
     */
    constructor(http_api) {
        this.#http_api = http_api;
        this.#css_cache = new CssCache();
    }

    /**
     * @returns {Promise<void>}
     */
    async init() {
        await this.#getCssService();
    }

    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet | HTMLStyleElement>}
     */
    async importCss(url) {
        return (await this.#getCssService()).importCss(
            url
        );
    }

    /**
     * @param {ShadowRoot | Document} root
     * @param {string} url
     * @returns {void}
     */
    importCssToRoot(root, url) {
        this.#css_service.importCssToRoot(
            root,
            url
        );
    }

    /**
     * @returns {Promise<CssService>}
     */
    async #getCssService() {
        this.#css_service ??= (await import("../../Service/Css/Port/CssService.mjs")).CssService.new(
            this.#css_cache,
            await this.#getImportCss()
        );

        return this.#css_service;
    }

    /**
     * @returns {Promise<ImportCss>}
     */
    async #getImportCss() {
        if (this.#import_css === null) {
            try {
                if (navigator.userAgentData?.brands?.some(brand => brand.brand === "Chromium") ?? false) {
                    this.#import_css ??= (await import("../ImportCss/AssertImportCss.mjs")).AssertImportCss.new();

                    return this.#import_css;
                }
            } catch (error) {
                console.error(error);
            }

            console.info("Unsupported assert import - Using fetch fallback");

            this.#import_css ??= (await import("../ImportCss/FetchImportCss.mjs")).FetchImportCss.new(
                this.#css_cache,
                this.#http_api
            );
        }

        return this.#import_css;
    }
}
