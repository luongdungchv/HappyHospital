import { Tilemaps } from "phaser";
import { Physics } from "phaser";
import { Text } from "./text";
import DynamicEntity from "./DynamicEntity";
import { ValidDestination } from "./Constants";
import { lerp } from "./Constants";
import ServerEntity from "./ServerEntity";
import { secondsToHMS } from "./Constants";

class AutoAgvServer extends ServerEntity {
   constructor(scene, x, y, id, dest) {
      super(scene, x, y, "agv");
      // this.x = x;
      // this.y = y;
      this.curPos = { x: x, y: y };
      this.src = { x, y };
      //this.curPos = { x: 2, y: 14 };
      scene.autoAgvsServer.push(this);
      this.id = id;
      console.log("agv created: ", id);
      this.dest = dest;
      this.displayText = new Text(
         this.scene,
         this.x,
         this.y - this.height * 0.5,
         `${this.id}`,
         "16px",
         "#ff002b"
      );

      this.startTime = 0;

      this.calculateDeadline();
      this.writeDeadline();
      this.updateDestText();
      //this.updatePosition();
   }
   updateDestText() {
      let split = this.id.split("v");
      this.desText = new Text(
         this.scene,
         this.dest.x * 32,
         this.dest.y * 32,
         `DES${split[1]}`,
         "16px",
         "#ff002b"
      );
   }
   writeDeadline() {
      let split = this.id.split("v");
      let id = split[1];
      let des = document.querySelector("#des");
      var enter = "\n";
      //if (des.innerHTML.length > 0) enter = "\n";
      des.innerHTML =
         "DES_" +
         id +
         ": " +
         secondsToHMS(this.deadline) +
         " ± " +
         "4" +
         enter +
         des.innerHTML;
   }
   calculateDeadline() {
      this.deadline = Math.floor(
         (Math.abs(this.dest.x - this.src.x) +
            Math.abs(this.dest.y - this.src.y)) *
            (32 / 64)
      );
   }
   eraseDeadline() {
      let split = this.id.split("v");
      let id = split[1];
      let des = document.querySelector("#des");
      var enter = "\n";

      //if (des.innerHTML.length > 0) enter = "\n";
      let eraseText =
         "DES_" + id + ": " + secondsToHMS(this.deadline) + " ± " + "4" + enter;
      console.log(eraseText, des.innerHTML);
      console.log(des.innerHTML.toString().includes(eraseText));
      des.innerHTML = des.innerHTML.toString().replace(eraseText, "");
   }

   notify(msg) {
      let cmdList = msg.split(" ");
      cmdList[2] == "el" && console.log("eliminate cmd");
      if (cmdList[0] == "atagv" && cmdList[1] == this.id) {
         if (cmdList[2] == "pos") {
            this.setPosition(this.curPos.x * 32, this.curPos.y * 32);

            this.curPos.x = parseInt(cmdList[3]);
            this.curPos.y = parseInt(cmdList[4]);

            this.updatePosition(10, 0.0215);
         } else if (cmdList[2] == "el") {
            console.log("eliminate command");
            this.eliminate();
         } else if (cmdList[2] == "dest") {
            this.desText.destroy();
            this.eraseDeadline();
            this.dest = {
               x: parseInt(cmdList[3]),
               y: parseInt(cmdList[4]),
            };
            this.src = { ...this.curPos };

            let finishTime = (performance.now() - this.startTime) / 1000;
            let hNess = Math.abs(finishTime - this.deadline);
            this.scene.harmfulness += hNess;
            this.scene.updateHarmfulness();

            this.calculateDeadline();
            this.writeDeadline();
            this.updateDestText();
         }
      }
      //this.curPos = { x: 48, y: 14 };
   }
}
export default AutoAgvServer;
