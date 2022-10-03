import { CssCache } from "../Cache/CssCache.mjs";
import { CssService } from "../../Service/Css/Port/CssService.mjs";

/** @typedef {import("../../../../flux-fetch-api/src/Adapter/Api/FetchApi.mjs").FetchApi} FetchApi */
/** @typedef {import("../ImportCss/ImportCss.mjs").ImportCss} ImportCss */

export class CssApi {
    /**
     * @type {CssCache | null}
     */
    #css_cache = null;
    /**
     * @type {CssService | null}
     */
    #css_service = null;
    /**
     * @type {FetchApi}
     */
    #fetch_api;
    /**
     * @type {ImportCss | null}
     */
    #import_css = null;

    /**
     * @param {FetchApi} fetch_api
     * @returns {CssApi}
     */
    static new(fetch_api) {
        return new this(
            fetch_api
        );
    }

    /**
     * @param {FetchApi} fetch_api
     * @private
     */
    constructor(fetch_api) {
        this.#fetch_api = fetch_api;
    }

    /**
     * @returns {Promise<void>}
     */
    async init() {
        this.#css_cache ??= new CssCache();

        this.#import_css ??= await this.#getImportCss();

        this.#css_service ??= this.#getCssService();
    }

    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet | HTMLStyleElement>}
     */
    async importCss(url) {
        return this.#css_service.importCss(
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
     * @returns {CssService}
     */
    #getCssService() {
        return CssService.new(
            this.#css_cache,
            this.#import_css
        );
    }

    /**
     * @returns {Promise<ImportCss>}
     */
    async #getImportCss() {
        /*try {
            return (await import("../ImportCss/AssertImportCss.mjs")).AssertImportCss.new();
        } catch (error) {
            console.info("Unsupported assert import - Using fetch fallback (", error, ")");*/

        return (await import("../ImportCss/FetchImportCss.mjs")).FetchImportCss.new(
            this.#css_cache,
            this.#fetch_api
        );
        //}
    }
}
