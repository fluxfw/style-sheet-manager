/**
 * @deprecated
 */
export class FallbackImportCss {
    /**
     * @type {boolean | null}
     */
    #supports_blob_to_data_url = null;

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

                _css = _css.replaceAll(_url, `url("${await this.#supportsBlobToDataUrl() ? await this.#blobToDataUrl(
                    await response.blob()
                ) : `data:${response.headers.get("Content-Type") ?? ""};base64,${btoa(Array.from(new Uint8Array(await response.arrayBuffer())).map(char => String.fromCharCode(char)).join(""))}`}")`);
            }

            css.insertRule(_css, css.cssRules.length);
        }

        return css;
    }

    /**
     * @param {Blob} blob
     * @returns {Promise<string>}
     */
    async #blobToDataUrl(blob) {
        return new Promise((resolve, reject) => {
            const file_reader = new FileReader();

            file_reader.addEventListener("error", () => {
                reject(file_reader.error);
            });

            file_reader.addEventListener("load", () => {
                resolve(file_reader.result);
            });

            file_reader.readAsDataURL(blob);
        });
    }

    /**
     * @returns {Promise<boolean>}
     */
    async #supportsBlobToDataUrl() {
        this.#supports_blob_to_data_url ??= await (async () => {
            try {
                await this.#blobToDataUrl(
                    new Blob()
                );

                return true;
            } catch (error) {
                console.error(error);
            }

            console.info("Unsupported blob to data url - Using fallback");

            return false;
        })();

        return this.#supports_blob_to_data_url;
    }
}
