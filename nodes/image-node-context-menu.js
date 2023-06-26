export class ImageNodeContextMenu {
    constructor(parent, x, y, ...options) {
        //create context menu at coords (x, y)
        this.parent = parent;
        const wrap = document.createElement("div");
        wrap.className = "image-node-context-menu-main";
        this.x = x;
        this.y = y;

        for (var i = 0; i < options.length; i++) {
            this.addMenuElement(wrap, options[i]);
        }

        parent.parent.appendChild(wrap);
        this.wrap = wrap;

        const rect = this.parent.parent.getBoundingClientRect();
        const rect2 = wrap.getBoundingClientRect();
        if (rect.x + rect.width <= x + rect2.width) {
            wrap.style.left = `${x - rect2.width}px`;
        } else {
            wrap.style.left = `${x}px`;
        }
        if (rect.y + rect.height <= y + rect2.height) {
            wrap.style.top = `${y - rect2.height}px`;
        } else {
            wrap.style.top = `${y}px`;
        }
    }
    addMenuElement(wrap, elem) {
        switch (elem.type) {
            case "label":
                this.addMenuLabel(wrap, elem.text);
                break;
            case "selection":
                this.addMenuSelection(wrap, elem.options, elem.button);
                break;
            case "button":
                this.addMenuButton(wrap, elem.text, elem.action);
                break;
            case "hover":
                this.addMenuHover(wrap, elem.text, elem.options);
                break;
            default:
                break;
        }
    }
    addMenuLabel(wrap, text) {
        const label = document.createElement("div");
        label.className = "image-node-context-menu-label";
        label.textContent = text;
        wrap.appendChild(label);
    }
    addMenuSelection(wrap, options, but) {
        const select_wrap = document.createElement("div");
        select_wrap.className = "image-node-context-menu-selection-wrap";

        const select = document.createElement("select");
        select.className = "image-node-context-menu-selection-select";
        if (options.length > 1) {
            for (var i = 0; i < options.length; i++) {
                const group = document.createElement("optgroup");
                group.label = options[i].groupname;
                for (var j = 0; j < options[i].options.length; j++) {
                    const opt = document.createElement("option");
                    opt.value = options[i].options[j].value;
                    opt.textContent = options[i].options[j].text;
    
                    group.appendChild(opt);
                }
                select.appendChild(group);
            }
        } else {
            for (var i = 0; i < options[0].options.length; i++) {
                const opt = document.createElement("option");
                opt.value = options[0].options[i].value;
                opt.textContent = options[0].options[i].text;

                select.appendChild(opt);
            }
        }

        const button = document.createElement("div");
        button.className = "image-node-context-menu-selection-button";
        button.textContent = but.text;
        const parent = this.parent;
        button.onclick = function() {
            but.action(select);
            parent.removeContextMenu();
        }

        select_wrap.appendChild(select);
        select_wrap.appendChild(button);

        wrap.appendChild(select_wrap);
    }
    addMenuButton(wrap, text, action) {
        const button = document.createElement("div");
        button.className = "image-node-context-menu-button";
        button.textContent = text;
        const parent = this.parent;
        button.onclick = function() {
            const check = action();
            if (!check) {
                parent.removeContextMenu();
            }
        }
        wrap.appendChild(button);
    }
    addMenuHover(wrap, text, options) {
        const hover = document.createElement("div");
        hover.className = "image-node-context-menu-button";
        hover.textContent = text;
        wrap.appendChild(hover);

        const parent = this.parent;
        const menuitem = this;
        const rect = parent.parent.getBoundingClientRect();
        hover.onmouseenter = function() {
            const wrap2 = document.createElement("div");
            wrap2.className = "image-node-context-menu-main";

            for (var i = 0; i < options.length; i++) {
                menuitem.addMenuElement(wrap2, options[i]);
            }

            hover.appendChild(wrap2);

            const rect2 = hover.getBoundingClientRect();
            const rect3 = wrap.getBoundingClientRect();
            const rect4 = wrap2.getBoundingClientRect();

            if (rect.x + rect.width <= rect3.right + rect2.width) {
                wrap2.style.left = `${rect2.width * -1}px`;
            } else {
                wrap2.style.left = `${rect2.width}px`;
            }
            if (rect.y + rect.height <= rect2.y + rect4.height) {
                wrap2.style.top = `${rect2.top - rect3.top - rect4.height + rect2.height}px`;
            } else {
                wrap2.style.top = `${rect2.top - rect3.top}px`;
            }
        }
        hover.onmouseleave = function() {
            while (hover.firstChild) {
                hover.removeChild(hover.firstChild);
            }
            hover.textContent = text;
        }
    }
    remove() {
        this.wrap.remove();
    }
}

export function getCanvasRightClickMenu(parent, x, y) {
    return new ImageNodeContextMenu(parent, x, y, {
        type: "label",
        text: "Add node:"
    },{
        type: "hover",
        text: "> Inputs",
        options: [
            {
                type: "button",
                text: "Image",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-img");
                    return false;
                }
            },{
                type: "button",
                text: "Value",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-val");
                    return false;
                }
            },{
                type: "button",
                text: "Colour",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-colour");
                    return false;
                }
            }
        ]
    },{
        type: "hover",
        text: "> Basic Operations",
        options: [
            {
                type: "button",
                text: "Invert",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-invert");
                    return false;
                }
            },{
                type: "button",
                text: "Add",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-add");
                    return false;
                }
            },{
                type: "button",
                text: "Multiply",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-multiply");
                    return false;
                }
            },{
                type: "button",
                text: "Overlay",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-overlay");
                    return false;
                }
            }
        ]
    },{
        type: "hover",
        text: "> Mask Operations",
        options: [
            {
                type: "button",
                text: "Mask",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-mask");
                    return false;
                }
            },{
                type: "button",
                text: "Diffuse",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-diffuse");
                    return false;
                }
            },{
                type: "button",
                text: "Erode",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-erosion");
                    return false;
                }
            },{
                type: "button",
                text: "To Image",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-toimg");
                    return false;
                }
            }
        ]
    },{
        type: "hover",
        text: "> Colour Channels",
        options: [
            {
                type: "button",
                text: "Deconstruct",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-deconst");
                    return false;
                }
            },{
                type: "button",
                text: "Construct",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-const");
                    return false;
                }
            }
        ]
    },{
        type: "hover",
        text: "> Effects",
        options: [
            {
                type: "button",
                text: "Pixelate",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-pixel");
                    return false;
                }
            },{
                type: "button",
                text: "Gamma Limit",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-limit");
                    return false;
                }
            },{
                type: "button",
                text: "Blur",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-blur");
                    return false;
                }
            },{
                type: "button",
                text: "Pixel Sort",
                action: function() {
                    parent.createNodeAt(x, y, "im-node-sort");
                    return false;
                }
            }
        ]
    });
}

export function getNodeContextMenu(parent, x, y, button_action) {
    return new ImageNodeContextMenu(parent, x, y, {
        type: "button",
        text: "Remove",
        action: button_action
    });
}