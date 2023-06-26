import { GenericImageNode } from "../../image-node-object.js";
import { AnyInputNodeConnector, AnyOutputNodeConnector, ColourOutputNodeConnector, ImageOutputNodeConnector, MaskOutputNodeConnector, ValueOutputNodeConnector } from "../../image-node-connector.js"; 

export class ExampleNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "example";
        this.base_element.style.border = "1px solid seashell";
        this.base_top.style.backgroundColor = "seashell";
        this.spacer.style.color = "seashell";
        this.spacer.style.display = "none";

        this.canvas = document.createElement("canvas");
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.options.appendChild(this.canvas);

        this.inputs.push(new AnyInputNodeConnector(this));
        this.outputs.push(new AnyOutputNodeConnector(this));

        this.inputvalue = undefined;
        this.inputtype = undefined;
    }
    process() {
        if (this.inputtype) {
            /*TO DO*/
            //has input -> find connected inputs from output
            for (var i = 0; i < this.parent.connections.length; i++) {
                if (this.parent.connections[i].output == this.outputs[0]) {
                    this.parent.connections[i].input.parent.receiveInput(out, this.parent.connections[i].output, this.parent.connections[i].input);
                }
            }
        }
    }
    receiveInput(input, connector, connected) {
        //determine input type
        if (typeof input == "number") {
            //input is a number
            this.inputtype = "number";
            this.spacer.style.display = "none";
            this.options.style.display = "none";
            if (!(this.outputs[0] instanceof ValueOutputNodeConnector)) {
                //change output node based on input type
                this.tryReconnectNodes(ValueOutputNodeConnector);
            }
        } else {
            //input is an object
            if (input.nodeName && input.nodeName.toLowerCase() == "canvas") {
                //input is an image/canvas or mask
                this.spacer.style.display = "flex";
                if (connector instanceof ImageOutputNodeConnector) {
                    //input is an image
                    this.inputtype = "image";
                    if (!(this.outputs[0] instanceof ImageOutputNodeConnector)) {
                        //change output node based on input type
                        this.tryReconnectNodes(ImageOutputNodeConnector);
                    }
                } else {
                    //input is a mask
                    this.inputtype = "mask";
                    if (!(this.outputs[0] instanceof MaskOutputNodeConnector)) {
                        //change output node based on input type
                        this.tryReconnectNodes(MaskOutputNodeConnector);
                    }
                }
            } else {
                //input is a colour
                this.inputtype = "colour";
                this.spacer.style.display = "none";
                this.options.style.display = "none";
                if (!(this.outputs[0] instanceof ColourOutputNodeConnector)) {
                    //change output node based on input type
                    this.tryReconnectNodes(ColourOutputNodeConnector);
                }
            }
        }
        this.inputvalue = input;
        this.process();
    }
    forgetInput() {
        this.inputvalue = undefined;
        this.inputtype = undefined;
        this.spacer.style.display = "none";
        this.options.style.display = "none";
        if (!(this.outputs[0] instanceof AnyOutputNodeConnector)) {
            //change output node based on input type
            this.tryReconnectNodes(AnyOutputNodeConnector);
        }
        this.process();
    }
}