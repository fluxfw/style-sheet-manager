/** @typedef {import("../../../Adapter/Cache/CssCache.mjs").CssCache} CssCache */
/** @typedef {import("../Port/CssService.mjs").CssService} CssService */

export class ImportCssToRootCommand {
    /**
     * @type {CssCache}
     */
    #css_cache;
    /**
     * @type {CssService}
     */
    #css_service;

    /**
     * @param {CssCache} css_cache
     * @param {CssService} css_service
     * @returns {ImportCssToRootCommand}
     */
    static new(css_cache, css_service) {
        return new this(
            css_cache,
            css_service
        );
    }

    /**
     * @param {CssCache} css_cache
     * @param {CssService} css_service
     * @private
     */
    constructor(css_cache, css_service) {
        this.#css_cache = css_cache;
        this.#css_service = css_service;
    }

    /**
     * @param {ShadowRoot | Document} root
     * @param {string} url
     * @returns {void}
     */
    importCssToRoot(root, url) {
        if (this.#css_cache.has(url)) {
            this.#adopt(
                root,
                this.#css_cache.get(url)
            );
        } else {
            this.#css_service.importCss(
                url
            ).then(sheet => {
                this.#css_cache.set(url, sheet);

                this.#adopt(
                    root,
                    sheet
                );
            }).catch(error => {
                console.error(`Import css ${url} failed (`, error, ")");
            });
        }
    }

    /**
     * @param {ShadowRoot | Document} root
     * @param {CSSStyleSheet | HTMLStyleElement} sheet
     * @returns {void}
     */
    #adopt(root, sheet) {
        if (sheet instanceof HTMLStyleElement) {
            const cloned_sheet = sheet.cloneNode(true);

            if (root instanceof Document) {
                root.head.appendChild(cloned_sheet);
            } else {
                root.prepend(cloned_sheet);
            }
        } else {
            try {
                root.adoptedStyleSheets.push(sheet);
            } catch (error) {
                console.error("Unsupported adoptedStyleSheets - No fallback possible in this context (", error, ")");
            }
        }
    }
}
