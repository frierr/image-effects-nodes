import { GenericImageNode } from "../../image-node-object.js";
import { ValueOutputNodeConnector } from "../../image-node-connector.js"; 

export class ValueInputNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "VALUE";

        this.inputvalue = 0;
        const numberinput = document.createElement("input");
        numberinput.type = "number";
        numberinput.value = this.inputvalue;
        this.options.appendChild(numberinput);

        const node = this;
        numberinput.onchange = function() {
            node.changeInputValue(Number(numberinput.value));
        }

        this.outputs.push(new ValueOutputNodeConnector(this));
    }
    changeInputValue(value) {
        this.inputvalue = value;
        this.central_element.textContent = `${this.inputvalue}`;
        this.process();
    }
    process() {
        //find connected inputs from output
        for (var i = 0; i < this.parent.connections.length; i++) {
            if (this.parent.connections[i].output == this.outputs[0]) {
                this.parent.connections[i].input.parent.receiveInput(this.inputvalue, this.parent.connections[i].output, this.parent.connections[i].input);
            }
        }
    }
}