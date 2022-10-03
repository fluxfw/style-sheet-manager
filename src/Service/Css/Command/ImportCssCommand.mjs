/** @typedef {import("../../../Adapter/ImportCss/ImportCss.mjs").ImportCss} ImportCss */

export class ImportCssCommand {
    /**
     * @type {ImportCss}
     */
    #import_css;

    /**
     * @param {ImportCss} import_css
     * @returns {ImportCssCommand}
     */
    static new(import_css) {
        return new this(
            import_css
        );
    }

    /**
     * @param {ImportCss} import_css
     * @private
     */
    constructor(import_css) {
        this.#import_css = import_css;
    }

    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet | HTMLStyleElement>}
     */
    async importCss(url) {
        return this.#import_css.importCss(
            url
        );
    }
}
