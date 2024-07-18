export class StyleSheetManager {
    /**
     * @type {CSSStyleSheet[]}
     */
    #root_style_sheets = [];
    /**
     * @type {(Document | ShadowRoot)[]}
     */
    #roots = [];
    /**
     * @type {CSSStyleSheet[]}
     */
    #shadow_style_sheets = [];
    /**
     * @type {{[key: string]: string}}
     */
    #type_variables;
    /**
     * @type {Map<string, CSSStyleSheet>}
     */
    #variables_root_style_sheets = new Map();

    /**
     * @param {{[key: string]: string}} type_variables
     * @returns {Promise<StyleSheetManager>}
     */
    static async new(type_variables) {
        const style_sheet_manager = new this(
            type_variables
        );

        await style_sheet_manager.addRoot(
            document
        );

        return style_sheet_manager;
    }

    /**
     * @param {{[key: string]: string}} type_variables
     * @private
     */
    constructor(type_variables) {
        this.#type_variables = type_variables;
    }

    /**
     * @param {Document | ShadowRoot} root
     * @returns {Promise<void>}
     */
    async addRoot(root) {
        if (this.#roots.includes(root)) {
            return;
        }

        this.#roots.push(root);

        for (const style_sheet of this.#root_style_sheets) {
            if (root.adoptedStyleSheets.includes(style_sheet)) {
                continue;
            }

            root.adoptedStyleSheets.push(style_sheet);
        }
    }

    /**
     * @param {CSSStyleSheet} style_sheet
     * @param {boolean | null} beginning
     * @returns {Promise<void>}
     */
    async addRootStyleSheet(style_sheet, beginning = null) {
        if (this.#root_style_sheets.includes(style_sheet)) {
            return;
        }

        const method = beginning ?? false ? "unshift" : "push";

        this.#root_style_sheets[method](style_sheet);

        for (const root of this.#roots) {
            if (root.adoptedStyleSheets.includes(style_sheet)) {
                continue;
            }

            root.adoptedStyleSheets[method](style_sheet);
        }
    }

    /**
     * @param {CSSStyleSheet} style_sheet
     * @param {boolean | null} beginning
     * @returns {Promise<void>}
     */
    async addShadowStyleSheet(style_sheet, beginning = null) {
        if (this.#shadow_style_sheets.includes(style_sheet)) {
            return;
        }

        this.#shadow_style_sheets[beginning ?? false ? "unshift" : "push"](style_sheet);

        await this.addRootStyleSheet(
            style_sheet,
            beginning
        );
    }

    /**
     * @param {ShadowRoot} shadow
     * @returns {Promise<void>}
     */
    async addStyleSheetsToShadow(shadow) {
        for (const style_sheet of this.#shadow_style_sheets) {
            if (shadow.adoptedStyleSheets.includes(style_sheet)) {
                continue;
            }

            shadow.adoptedStyleSheets.push(style_sheet);
        }
    }

    /**
     * @param {string} id
     * @param {{[key: string]: string}} variables
     * @param {boolean | null} beginning
     * @returns {Promise<void>}
     */
    async generateVariablesRootStyleSheet(id, variables, beginning = null) {
        if (this.#variables_root_style_sheets.has(id)) {
            return;
        }

        const style_sheet = new CSSStyleSheet();

        const style_sheet_rule = style_sheet.cssRules[style_sheet.insertRule(":root, :host {}")];

        for (const [
            variable,
            type
        ] of Object.entries(variables)) {
            if ((this.#type_variables[type] ?? "") === "") {
                continue;
            }

            style_sheet_rule.style.setProperty(variable, `var(${this.#type_variables[type]})`);
        }

        this.#variables_root_style_sheets.set(id, style_sheet);

        await this.addRootStyleSheet(
            style_sheet,
            beginning
        );
    }
}
