import { FETCH_ASSERT_TYPE_CSS } from "../../../../flux-http-api/src/Adapter/Fetch/FETCH_ASSERT_TYPE.mjs";
import { ImportCss } from "./ImportCss.mjs";

export class AssertImportCss extends ImportCss {
    /**
     * @returns {AssertImportCss}
     */
    static new() {
        return new this();
    }

    /**
     * @private
     */
    constructor() {
        super();
    }

    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet>}
     */
    async importCss(url) {
        return (await import(url, { assert: { type: FETCH_ASSERT_TYPE_CSS } })).default;
    }
}
