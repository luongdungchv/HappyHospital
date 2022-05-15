import { Tilemaps } from "phaser";
import { Physics } from "phaser";
import { Text } from "./text";
import { ValidDestination } from "./Constants";
import { calPathAstarGrid } from "./graph";
import DynamicEntity from "./DynamicEntity";
import AIEntity from "./AI";

class Agent extends AIEntity {
   constructor(scene, x, y, destIndex, id) {
      super(scene, x, y, "tile_sprites", 17, Math.random() * 5 + 13);

      this.scene = scene;
      this.destIndex = null;
      id ? (this.id = id) : (this.id = Math.floor(Math.random() * 100));
      destIndex ? this.initDest(x, y, destIndex) : this.changeDest(x, y);
      this.displayText = new Text(
         this.scene,
         this.x,
         this.y - this.height * 0.5,
         `${this.id}`,
         "16px",
         "#ffffff"
      );
      this.isPrior = false;

      //this.movePattern = movePattern;
   }
   changeDest(x, y) {
      this.desText?.destroy();
      console.log("agent changeDest");
      let b = Math.floor(Math.random() * this.scene.doorPos.length);

      while (
         !ValidDestination(
            this.scene.doorPos[b].x,
            this.scene.doorPos[b].y,
            1,
            14
         )
      ) {
         b = Math.floor(Math.random() * this.scene.doorPos.length);
      }
      //let finalDest = {};
      this.finalDest = this.scene.doorPos[b];

      this.destIndex = b;
      this.initPath(x, y);
   }
   initPath(x, y) {
      this.movePattern = calPathAstarGrid(
         52,
         28,
         this.scene.groundPos,
         { x: x, y: y },
         //this.scene.doorPos[b]
         this.finalDest
      );
      this.curDest = this.movePattern?.pop();
      this.desText = new Text(
         this.scene,
         this.finalDest?.x * 32,
         this.finalDest?.y * 32,
         `${this.id}`,
         "16px",
         "#ffffff"
      );
   }
   initDest(x, y, destIndex) {
      console.log("agent initDest");
      this.destIndex = destIndex;
      this.finalDest = this.scene.doorPos[destIndex];
      console.log({
         x: x,
         y: y,
         id: this.id,
         dest: this.finalDest,
      });
      this.initPath(x, y);
   }
   recalculatePath(x, y, excludedPos) {
      let clonePos = [...this.scene.groundPos];

      clonePos = clonePos.filter(
         (i) => i.x != excludedPos.x || i.y != excludedPos.y
         // (i.x != excludedPos.x || i.y != excludedPos.y + 1) &&
         // (i.x != excludedPos.x || i.y != excludedPos.y - 1)
      );
      // console.log(clonePos);
      // console.log(this.scene.groundPos);
      // console.log(excludedPos);
      //console.log(this.movePattern, this.id, excludedPos);
      this.movePattern = calPathAstarGrid(
         52,
         28,
         clonePos,
         { x: x, y: y },
         this.scene.doorPos[this.destIndex]
      );

      if (!this.movePattern || this.movePattern.length == 0) {
         this.changeDest(x, y);
         return;
      }
      //console.log(this.movePattern, this.id);
      this.movePattern.pop();
      this.curDest = this.movePattern.pop();
      this.id == 24 && console.log(x, y, this.curDest);

      this.scene.setBusyGridState(this.curDest.x, this.curDest.y, null);

      //console.log({ a: this.curDest, b: excludedPos });
      //console.log({ a: clonePos.length, b: this.scene.groundPos.length });
      // console.log({
      //    a: this.curDest,
      //    b: this.movePattern,
      //    c: excludedPos,
      //    d: `${x} ${y}`,
      // });
   }
}
export default Agent;
