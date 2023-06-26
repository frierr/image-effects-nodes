import { GenericImageNode } from "../../image-node-object.js";
import { ImageOutputNodeConnector } from "../../image-node-connector.js"; 

export class ImageInputNode extends GenericImageNode {
    constructor(parent, x, y) {
        super(parent, x, y);
        this.central_element.textContent = "IMAGE";

        const imageinput = document.createElement("input");
        imageinput.type = "file";
        imageinput.accept = "image/png, image/jpeg";
        this.options.appendChild(imageinput);

        this.canvas = document.createElement("canvas");
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.options.appendChild(this.canvas);

        const ctx = this.canvas.getContext("2d");
        const canvas = this.canvas;
        const node = this;
        imageinput.onchange = function(event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    node.process();
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(file);
        }

        this.outputs.push(new ImageOutputNodeConnector(this));
    }
    process() {
        if (this.canvas.width > 0) {
            //has input -> find connected inputs from output
            for (var i = 0; i < this.parent.connections.length; i++) {
                if (this.parent.connections[i].output == this.outputs[0]) {
                    this.parent.connections[i].input.parent.receiveInput(this.canvas, this.parent.connections[i].output, this.parent.connections[i].input);
                }
            }
        }
    }
}