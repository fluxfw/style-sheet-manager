/** @typedef {import("./ImportCss.mjs").ImportCss} ImportCss */

/**
 * @implements {ImportCss}
 */
export class AssertImportCss {
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

    }

    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet>}
     */
    async import(url) {
        return (await import(url, { assert: { type: "css" } })).default;
    }
}
