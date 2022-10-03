import { ASSERT_TYPE_CSS } from "../../../../flux-fetch-api/src/Adapter/AssertType/ASSERT_TYPE.mjs";
import { ImportCss } from "./ImportCss.mjs";

/** @typedef {import("../Cache/CssCache.mjs").CssCache} CssCache */
/** @typedef {import("../../../../flux-fetch-api/src/Adapter/Api/FetchApi.mjs").FetchApi} FetchApi */

export class FetchImportCss extends ImportCss {
    /**
     * @type {CssCache}
     */
    #css_cache;
    /**
     * @type {FetchApi}
     */
    #fetch_api;

    /**
     * @param {CssCache} css_cache
     * @param {FetchApi} fetch_api
     * @returns {FetchImportCss}
     */
    static new(css_cache, fetch_api) {
        return new this(
            css_cache,
            fetch_api
        );
    }

    /**
     * @param {CssCache} css_cache
     * @param {FetchApi} fetch_api
     * @private
     */
    constructor(css_cache, fetch_api) {
        super();

        this.#css_cache = css_cache;
        this.#fetch_api = fetch_api;
    }

    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet | HTMLStyleElement>}
     */
    async importCss(url) {
        let sheet;

        if (this.#css_cache.has(url)) {
            sheet = this.#css_cache.get(url);
        } else {
            const css = await this.#fetch_api.fetch(
                {
                    url,
                    no_ui: true,
                    assert_type: ASSERT_TYPE_CSS
                }
            );

            try {
                sheet = new CSSStyleSheet();
                await sheet.replace(css);
            } catch (error) {
                console.info("Unsupported CSSStyleSheet - Using HTMLStyleElement fallback (", error, ")");

                sheet = document.createElement("style");
                sheet.innerText = css;
            }

            this.#css_cache.set(url, sheet);
        }

        return sheet;
    }
}
