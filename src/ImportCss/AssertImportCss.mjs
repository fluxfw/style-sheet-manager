/** @typedef {import("./ImportCss.mjs").ImportCss} ImportCss */

/**
 * @implements {ImportCss}
 * @deprecated
 */
export class AssertImportCss {
    /**
     * @returns {AssertImportCss}
     * @deprecated
     */
    static new() {
        return new this();
    }

    /**
     * @private
     * @deprecated
     */
    constructor() {

    }

    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet>}
     * @deprecated
     */
    async import(url) {
        return (await import(url, { assert: { type: "css" } })).default;
    }
}
