import { Tilemaps } from "phaser";
import { Physics } from "phaser";
import { Text } from "./text";
import DynamicEntity from "./DynamicEntity";
import { ValidDestination } from "./Constants";
import { lerp } from "./Constants";

class ServerEntity extends DynamicEntity {
   constructor(scene, x, y, name, frame) {
      super(scene, x, y, name, frame);
      // this.x = x;
      // this.y = y;
      this.curPos = { x: x, y: y };
      this.newPos = { x: x * 32, y: y * 32 };
      //this.curPos = { x: 2, y: 14 };

      this.elapse = 0;

      //this.updatePosition();
   }
   update() {
      this.setPosition(this.newPos?.x, this.newPos?.y);
   }

   updatePosition(rate, delta) {
      this.elapse = 0;
      let count = 0;
      //console.log("update pos", this.curSrc);
      this.curSrc = { x: this.x, y: this.y };
      let moveTask = setInterval(() => {
         count++;
         if (this.elapse >= 1) {
            clearInterval(moveTask);
            return;
         }
         //this.setPosition(x * 32, y * 32);
         this.newPos = lerp(
            this.curSrc,
            { x: this.curPos.x * 32, y: this.curPos.y * 32 },
            this.elapse
         );

         //this.setPosition(this.newPos.x, this.newPos.y);
         this.displayText.setPosition(this.x, this.y - this.height * 0.5);
         if (this.elapse < 1) {
            this.elapse += delta;
         }
      }, rate);
      //this.setPosition(this.curPos.x * 32, this.curPos.y * 32);
   }
   notify(msg) {
      //this.curPos = { x: 48, y: 14 };
   }
}
export default ServerEntity;
