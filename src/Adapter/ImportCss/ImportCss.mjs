/**
 * @interface
 */
export class ImportCss {
    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet | HTMLStyleElement>}
     * @abstract
     */
    importCss(url) { }
}
