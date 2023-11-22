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
            let _css = rule.cssText;

            for (const [
                _url,
                file
            ] of _css.matchAll(/url\(["']?([^"']+)["']?\)/g)) {
                if (!_css.includes(_url) || file.startsWith("data:")) {
                    continue;
                }

                const response = await fetch(!file.includes(":") && !file.startsWith("/") ? `${url.substring(0, url.lastIndexOf("/"))}/${file}` : file);

                if (!response.ok) {
                    return Promise.reject(response);
                }

                const blob = await response.blob();

                _css = _css.replaceAll(_url, `url("${await new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.addEventListener("error", () => {
                        reject(reader.error);
                    });
                    reader.addEventListener("load", () => {
                        resolve(reader.result);
                    });

                    reader.readAsDataURL(blob);
                })}")`);
            }

            css.insertRule(_css, css.cssRules.length);
        }

        return css;
    }
}
