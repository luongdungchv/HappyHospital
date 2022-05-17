import { Tilemaps } from "phaser";
import { Physics } from "phaser";
import { Text } from "./text";
import { ValidDestination } from "./Constants";
import { calPathAstarGrid, calPathAstar } from "./graph";
import DynamicEntity from "./DynamicEntity";
import AIEntity from "./AI";
import { secondsToHMS } from "./Constants";

class AutoAgv extends AIEntity {
   constructor(scene, x, y, index, dest) {
      super(scene, x, y, "agv", 0, 70);
      this.scene = scene;
      this.pathLayer = scene.pathLayer;
      this.startTime = 0;
      this.index = index || Math.floor(Math.random() * 10);

      this.displayText = new Text(
         this.scene,
         this.x,
         this.y - this.height * 0.5,
         `AI_${this.index}`,
         "16px",
         "#ff002b"
      );

      let b = Math.floor(Math.random() * scene.pathPos.length);
      while (!ValidDestination(scene.pathPos[b].x, scene.pathPos[b].y, 1, 14)) {
         b = Math.floor(Math.random() * scene.pathPos.length);
      }
      this.destX = dest?.x;
      this.destY = dest?.y;
      dest ? this.initPath(x, y) : this.changeDest(x, y);
   }
   calculateLateness(finish, deadline) {
      let diff = Math.max(finish - deadline, deadline - finish);
      return diff * 5;
   }
   changeDest(x, y) {
      let b = Math.floor(Math.random() * this.scene.pathPos.length);
      while (
         !ValidDestination(
            this.scene.pathPos[b].x,
            this.scene.pathPos[b].y,
            x,
            y
         )
      ) {
         b = Math.floor(Math.random() * this.scene.pathPos.length);
      }

      this.destX = this.scene.pathPos[b].x;
      this.destY = this.scene.pathPos[b].y;
      this.initPath(x, y);
   }
   initPath(x, y) {
      this.movePattern = calPathAstar(
         this.scene.adjacentList,
         { x: x, y: y },
         { x: this.destX, y: this.destY }
      );
      if (!this.movePattern) {
         this.movePattern = calPathAstar(
            this.scene.adjacentList,
            { x: x, y: y },
            { x: 50, y: 13 }
         );
         if (!this.movePattern) {
            this.desText?.destroy();
            this.displayText?.destroy();
            this.scene.setBusyGridState(
               this.curSource?.x,
               this.curSource?.y,
               null
            );
            this.eraseDeadline();
            this.destroy();

            return;
         }
         this.destX = 50;
         this.destY = 13;
      }
      this.curDest = this.movePattern?.pop();
      this.eraseDeadline();
      this.deadline = Math.floor(
         Math.sqrt((this.destX - x) ** 2 * 64 + (this.destY - y) ** 2 * 64) *
            0.085
      );
      this.writeDeadline();
      let finish = performance.now() / 1000 - this.startTime;
      this.scene.harmfulness += this.calculateLateness(finish, this.deadline);
      this.scene.updateHarmfulness();
      this.startTime = performance.now() / 1000;

      this.desText?.destroy();
      this.desText = new Text(
         this.scene,
         this.destX * 32,
         this.destY * 32,
         `des-${this.index}`,
         "16px",
         "#ff002b"
      );
   }

   writeDeadline() {
      let des = document.querySelector("#des");
      console.log("writing deadline");
      var enter = "";
      if (des.innerHTML.length > 0) enter = "\n";
      des.innerHTML =
         "DES_" +
         this.index +
         ": " +
         secondsToHMS(this.deadline) +
         " ± " +
         "4" +
         enter +
         des.innerHTML;
   }
   eraseDeadline() {
      let des = document.querySelector("#des");
      var enter = "";
      if (des.innerHTML.length > 0) enter = "\n";
      let eraseText =
         "DES_" +
         this.index +
         ": " +
         secondsToHMS(this.deadline) +
         " ± " +
         "4" +
         enter;
      des.innerHTML = des.innerHTML.replace(eraseText, "");
   }
   getTilesWithin() {
      return this.pathLayer.getTilesWithinWorldXY(this.x, this.y, 31, 31);
   }
}
export default AutoAgv;
