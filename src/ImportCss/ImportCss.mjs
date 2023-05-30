/**
 * @interface
 */
export class ImportCss {
    /**
     * @param {string} url
     * @returns {Promise<CSSStyleSheet>}
     * @abstract
     */
    import(url) { }
}
