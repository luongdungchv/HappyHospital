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
      //id ? (this.id = id) : (this.id = Math.floor(Math.random() * 100));
      if (id) this.id = id;
      else {
         let newId = Math.floor(Math.random() * 10);
         while (scene.agentIds[newId]) {
            newId = Math.floor(Math.random() * 10);
         }
         this.id = newId;
         scene.agentIds[newId] = true;
      }
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
   }
   eliminate() {
      super.eleminate();
      delete this.scene.agentIds[this.id];
   }
   changeDest(x, y) {
      this.desText?.destroy();
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
      this.id == 24 && console.log(x, y);
      clonePos = clonePos.filter(
         (i) => i.x != excludedPos.x || i.y != excludedPos.y
      );

      this.movePattern = calPathAstarGrid(
         52,
         28,
         clonePos,
         { x: x, y: y },
         this.scene.doorPos[this.destIndex],
         this.id
      );

      if (!this.movePattern || this.movePattern.length == 0) {
         this.changeDest(x, y);
         return;
      }
      this.movePattern.pop();
      this.curDest = this.movePattern.pop();
      this.id == 24 && console.log(x, y, this.curDest);

      this.scene.setBusyGridState(this.curDest.x, this.curDest.y, null);
   }
}
export default Agent;
