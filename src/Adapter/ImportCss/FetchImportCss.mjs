import { CONTENT_TYPE_CSS } from "../../../../flux-http-api/src/Adapter/ContentType/CONTENT_TYPE.mjs";
import { HEADER_ACCEPT } from "../../../../flux-http-api/src/Adapter/Header/HEADER.mjs";
import { HttpClientRequest } from "../../../../flux-http-api/src/Adapter/Client/HttpClientRequest.mjs";
import { ImportCss } from "./ImportCss.mjs";

/** @typedef {import("../Cache/CssCache.mjs").CssCache} CssCache */
/** @typedef {import("../../../../flux-http-api/src/Adapter/Api/HttpApi.mjs").HttpApi} HttpApi */

export class FetchImportCss extends ImportCss {
    /**
     * @type {CssCache}
     */
    #css_cache;
    /**
     * @type {HttpApi}
     */
    #http_api;

    /**
     * @param {CssCache} css_cache
     * @param {HttpApi} http_api
     * @returns {FetchImportCss}
     */
    static new(css_cache, http_api) {
        return new this(
            css_cache,
            http_api
        );
    }

    /**
     * @param {CssCache} css_cache
     * @param {HttpApi} http_api
     * @private
     */
    constructor(css_cache, http_api) {
        super();

        this.#css_cache = css_cache;
        this.#http_api = http_api;
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
            const css = (await (await this.#http_api.request(
                HttpClientRequest.new(
                    url,
                    null,
                    null,
                    {
                        [HEADER_ACCEPT]: CONTENT_TYPE_CSS
                    }
                )
            )).body.css()).replaceAll("url(\"", `url("${url.substring(0, url.lastIndexOf("/"))}/`);

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
