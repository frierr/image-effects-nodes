import { GenericImageNode } from "../../image-node-object.js";
import { ColourOutputNodeConnector } from "../../image-node-connector.js"; 

export class ColourInputNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "COLOUR";

        this.colourvalue = {
            r: 0,
            g: 0,
            b: 0
        };

        const colourinput = document.createElement("input");
        colourinput.type = "color";
        colourinput.value = "#000000";
        this.options.appendChild(colourinput);

        const node = this;
        colourinput.onchange = function() {
            node.changeColourValue(colourinput.value);
        }

        this.outputs.push(new ColourOutputNodeConnector(this));
    }
    changeColourValue(value) {
        this.colourvalue.r = parseInt(value.substring(1, 3), 16);
        this.colourvalue.g = parseInt(value.substring(3, 5), 16);
        this.colourvalue.b = parseInt(value.substring(5, 7), 16);
        this.central_element.textContent = `(${this.colourvalue.r}, ${this.colourvalue.g}, ${this.colourvalue.b})`;
        this.process();
    }
    process() {
        //find connected inputs from output
        for (var i = 0; i < this.parent.connections.length; i++) {
            if (this.parent.connections[i].output == this.outputs[0]) {
                this.parent.connections[i].input.parent.receiveInput(this.colourvalue, this.parent.connections[i].output, this.parent.connections[i].input);
            }
        }
    }
}