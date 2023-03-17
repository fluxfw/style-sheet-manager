import { CONTENT_TYPE_CSS } from "../../../flux-http-api/src/ContentType/CONTENT_TYPE.mjs";
import { HEADER_ACCEPT } from "../../../flux-http-api/src/Header/HEADER.mjs";
import { HttpClientRequest } from "../../../flux-http-api/src/Client/HttpClientRequest.mjs";
import { ImportCss } from "./ImportCss.mjs";

/** @typedef {import("../../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */

export class FetchImportCss extends ImportCss {
    /**
     * @type {Map<CSSStyleSheet | HTMLStyleElement>}
     */
    #cache;
    /**
     * @type {FluxHttpApi}
     */
    #flux_http_api;

    /**
     * @param {Map<CSSStyleSheet | HTMLStyleElement>} cache
     * @param {FluxHttpApi} flux_http_api
     * @returns {FetchImportCss}
     */
    static new(cache, flux_http_api) {
        return new this(
            cache,
            flux_http_api
        );
    }

    /**
     * @param {Map<CSSStyleSheet | HTMLStyleElement>} cache
     * @param {FluxHttpApi} flux_http_api
     * @private
     */
    constructor(cache, flux_http_api) {
        super();

        this.#cache = cache;
        this.#flux_http_api = flux_http_api;
    }

    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet | HTMLStyleElement>}
     */
    async importCss(url) {
        let sheet;

        if (this.#cache.has(url)) {
            sheet = this.#cache.get(url);
        } else {
            const css = (await (await this.#flux_http_api.request(
                HttpClientRequest.new(
                    new URL(url),
                    null,
                    null,
                    {
                        [HEADER_ACCEPT]: CONTENT_TYPE_CSS
                    },
                    true
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

            this.#cache.set(url, sheet);
        }

        return sheet;
    }
}
