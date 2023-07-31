export class FluxStyleSheetManager {
    /**
     * @type {(Document | ShadowRoot)[]}
     */
    #roots;
    /**
     * @type {CSSStyleSheet[]}
     */
    #style_sheets;
    /**
     * @type {{[key: string]: string}}
     */
    #type_variables;
    /**
     * @type {Map<string, CSSStyleSheet>}
     */
    #variable_style_sheets;

    /**
     * @param {{[key: string]: string}} type_variables
     * @returns {Promise<FluxStyleSheetManager>}
     */
    static async new(type_variables) {
        const flux_style_sheet_manager = new this(
            type_variables
        );

        await flux_style_sheet_manager.addRoot(
            document
        );

        return flux_style_sheet_manager;
    }

    /**
     * @param {{[key: string]: string}} type_variables
     * @private
     */
    constructor(type_variables) {
        this.#type_variables = type_variables;
        this.#roots = [];
        this.#style_sheets = [];
        this.#variable_style_sheets = new Map();
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

        for (const style_sheet of this.#style_sheets) {
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
    async addStyleSheet(style_sheet, beginning = null) {
        if (this.#style_sheets.includes(style_sheet)) {
            return;
        }

        const method = beginning ?? null ? "unshift" : "push";

        this.#style_sheets[method](style_sheet);

        for (const root of this.#roots) {
            if (root.adoptedStyleSheets.includes(style_sheet)) {
                continue;
            }

            root.adoptedStyleSheets[method](style_sheet);
        }
    }

    /**
     * @param {string} id
     * @param {{[key: string]: string}} variables
     * @param {boolean | null} beginning
     * @returns {Promise<void>}
     */
    async generateVariableStyleSheet(id, variables, beginning = null) {
        if (this.#variable_style_sheets.has(id)) {
            return;
        }

        const style_sheet = new CSSStyleSheet();

        await style_sheet.replace(":root, :host { }");

        for (const [
            variable,
            type
        ] of Object.entries(variables)) {
            if ((this.#type_variables[type] ?? "") === "") {
                continue;
            }

            style_sheet.cssRules[0].style.setProperty(variable, `var(${this.#type_variables[type]})`);
        }

        this.#variable_style_sheets.set(id, style_sheet);

        await this.addStyleSheet(
            style_sheet,
            beginning
        );
    }
}
