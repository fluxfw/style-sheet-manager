/**
 * @deprecated
 */
export class FallbackImportCss {
    /**
     * @returns {FallbackImportCss}
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
        const div_element = document.createElement("div");
        div_element.style.display = "none";

        const shadow = div_element.attachShadow({
            mode: "closed"
        });

        const link_element = document.createElement("link");
        link_element.rel = "stylesheet";
        shadow.append(link_element);

        let style_sheet;
        try {
            style_sheet = await new Promise((resolve, reject) => {
                link_element.addEventListener("error", e => {
                    reject(e);
                });
                link_element.addEventListener("load", () => {
                    resolve(link_element.sheet);
                });

                link_element.href = url;

                document.body.append(div_element);
            });
        } finally {
            div_element.remove();
        }

        const css = new CSSStyleSheet();

        for (const rule of style_sheet.cssRules) {
            let rule_css = rule.cssText;

            let match;
            while ((match = rule_css.match(/url\(["']?([^"']+)["']?\)/)) !== null) {
                const response = await fetch(`${url.substring(0, url.lastIndexOf("/"))}/${match[1]}`);

                if (!response.ok) {
                    return Promise.reject(response);
                }

                rule_css = rule_css.replaceAll(match[0], `url("data:${response.headers.get("Content-Type") ?? ""};base64,${await response.text()}")`);
            }

            css.insertRule(rule_css, css.cssRules.length);
        }

        return css;
    }
}
