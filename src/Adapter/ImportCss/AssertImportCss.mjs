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
        return (await import(url, { assert: { type: "css" } })).default;
    }
}
