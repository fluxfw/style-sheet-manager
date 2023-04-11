import { CONTENT_TYPE_CSS } from "../../../flux-http-api/src/ContentType/CONTENT_TYPE.mjs";
import { HEADER_ACCEPT } from "../../../flux-http-api/src/Header/HEADER.mjs";
import { HttpClientRequest } from "../../../flux-http-api/src/Client/HttpClientRequest.mjs";

/** @typedef {import("../../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("./ImportCss.mjs").ImportCss} ImportCss */

/**
 * @implements {ImportCss}
 */
export class FetchImportCss {
    /**
     * @type {FluxHttpApi}
     */
    #flux_http_api;

    /**
     * @param {FluxHttpApi} flux_http_api
     * @returns {FetchImportCss}
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
    }

    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet | HTMLStyleElement>}
     */
    async import(url) {
        const text = (await (await this.#flux_http_api.request(
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

        let css;
        try {
            css = new CSSStyleSheet();
            await css.replace(text);
        } catch (error) {
            console.info("Unsupported CSSStyleSheet - Using HTMLStyleElement fallback (", error, ")");

            css = document.createElement("style");
            css.innerText = text;
        }

        return css;
    }
}
