import { Tilemaps } from "phaser";
import { Physics } from "phaser";
import { Text } from "./text";
import DynamicEntity from "./DynamicEntity";
import { ValidDestination } from "./Constants";
import { lerp } from "./Constants";
import ServerEntity from "./ServerEntity";

class AgentServer extends ServerEntity {
   constructor(scene, x, y, id) {
      super(scene, x, y, "tile_sprites", 17);
      // this.x = x;
      // this.y = y;
      this.curPos = { x: x, y: y };
      //this.curPos = { x: 2, y: 14 };
      scene.agentsServer.push(this);
      this.id = id;
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

   notify(msg) {
      let cmdList = msg.split(" ");
      cmdList[2] == "el" && console.log("eliminate cmd");
      if (cmdList[0] == "agent" && cmdList[1] == this.id) {
         if (cmdList[2] == "pos") {
            this.setPosition(this.curPos.x * 32, this.curPos.y * 32);

            this.curPos.x = parseInt(cmdList[3]);
            this.curPos.y = parseInt(cmdList[4]);

            this.updatePosition(80, 0.0215);
         } else if (cmdList[2] == "el") {
            console.log("eliminate command");
            this.eliminate();
         }
      }
      //this.curPos = { x: 48, y: 14 };
   }
}
export default AgentServer;
