import { Tilemaps } from "phaser";
import { Physics } from "phaser";
import { Text } from "./text";
import DynamicEntity from "./DynamicEntity";
import { ValidDestination } from "./Constants";
import { lerp } from "./Constants";
import ServerEntity from "./ServerEntity";

class AutoAgvServer extends ServerEntity {
   constructor(scene, x, y, id) {
      super(scene, x, y, "agv");
      // this.x = x;
      // this.y = y;
      this.curPos = { x: x, y: y };
      //this.curPos = { x: 2, y: 14 };
      scene.autoAgvsServer.push(this);
      this.id = id;
      console.log("agv created: ", id);
      this.displayText = new Text(
         this.scene,
         this.x,
         this.y - this.height * 0.5,
         `${this.id}`,
         "16px",
         "#ff002b"
      );
      this.elapse = 0;
      setTimeout(() => console.log("timeout"), 1000);
      this.timer = true;
      //this.updatePosition();
   }

   // updatePosition() {
   //    this.elapse = 0;
   //    let count = 0;
   //    //console.log("update pos", this.curSrc);
   //    this.curSrc = { x: this.x, y: this.y };
   //    let moveTask = setInterval(() => {
   //       count++;
   //       if (this.elapse >= 1) {
   //          clearInterval(moveTask);
   //          return;
   //       }
   //       //this.setPosition(x * 32, y * 32);
   //       let newPos = lerp(
   //          this.curSrc,
   //          { x: this.curPos.x * 32, y: this.curPos.y * 32 },
   //          this.elapse
   //       );

   //       this.setPosition(newPos.x, newPos.y);
   //       this.displayText.setPosition(this.x, this.y - this.height * 0.5);
   //       if (this.elapse < 1) {
   //          this.elapse += 0.0215;
   //       }
   //    }, 10);
   //    //this.setPosition(this.curPos.x * 32, this.curPos.y * 32);
   // }
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
         }
      }
      //this.curPos = { x: 48, y: 14 };
   }
}
export default AutoAgvServer;
