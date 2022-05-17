import { Tilemaps } from "phaser";
import { Physics } from "phaser";
import { Text } from "./text";
import { ValidDestination } from "./Constants";
import { calPathAstarGrid } from "./graph";
import DynamicEntity from "./DynamicEntity";

class AIEntity extends DynamicEntity {
   constructor(scene, x, y, name, frame, speed) {
      super(scene, x, y, name, frame);

      this.curDest = {};
      this.name = name;
      this.movePattern = [];
      this.immobile = false;
      this.speed = speed;
      this.displayText = new Text(
         this.scene,
         this.x,

         this.y - this.height * 0.5,
         "",
         "16px",
         "#ff002b"
      );
      this.randX = 0;
      this.randY = 0;
   }
   move() {
      let dest =
         this.name == "agv"
            ? this.curDest
            : {
                 x: this.curDest?.x + this.randX,
                 y: this.curDest?.y + this.randY,
              };
      this.scene.physics.moveTo(this, dest.x * 32, dest.y * 32, this.speed);
   }
   recalculatePath(x, y, excludedPos) {}
   update() {
      if (!this.active) {
         delete this;
         return;
      }

      this.displayText.setPosition(this.x, this.y - this.height * 0.5);
      this.setVelocity(0, 0);
      if (this.stop === true) return;

      let x = Math.round(this.x / 32);
      let y = Math.round(this.y / 32);

      if (
         this.curDest &&
         Math.abs((this.curDest.x + this.randX) * 32 - this.x) < 1 &&
         Math.abs((this.curDest.y + this.randY) * 32 - this.y) < 1
      ) {
         if (this.curSource)
            this.scene.setBusyGridState(
               this.curSource.x,
               this.curSource.y,
               null
            );
         this.curSource = this.curDest;
         this.curDest = this.movePattern.pop();
         if (!this.curDest) return;

         this.scene.setBusyGridState(this.curSource.x, this.curSource.y, this);
         if (!this.scene.getBusyGridState(this.curDest.x, this.curDest.y)) {
            this.scene.setBusyGridState(this.curDest.x, this.curDest.y, this);
         }

         const logObj = {
            realCur: `x:${this.x / 32}, y:${this.y / 32}`,
            cur: `x:${x}, y:${y}`,
            dest: `x:${this.curDest.x}, y:${this.curDest.y}`,
         };
         this.randX = this.name == "agv" ? 0 : Math.random() * 0.4 - 0.2;
         this.randY = this.name == "agv" ? 0 : Math.random() * 0.4 - 0.2;
         this.id == 24 && console.log(this.curDest, this.id);
         this.setVelocity(0);

         return;
      } else if (!this.curDest) {
         if (this.name != "agv") {
            this.scene.setBusyGridState(
               this.curSource?.x,
               this.curSource?.y,
               null
            );
            this.scene.setBusyGridState(this.curDest?.x, this.curDest?.y, null);
            this.scene.socket.send("rm");
            this.desText?.destroy();
            this.displayText?.destroy();
            this?.destroy();
            return;
         }
         this.changeDest(x, y);
         if (this.name == "agv") {
            this.stop = true;
            setTimeout(() => {
               this.stop = false;
            }, 4000);
         }
      } else {
         if (
            this.scene.getBusyGridState(this.curDest.x, this.curDest.y) !=
               null &&
            this.scene.getBusyGridState(this.curDest.x, this.curDest.y) != this
         ) {
            if (this.name == "agv") {
               this.setVelocity(0, 0);
            }

            if (this.name != "agv") {
               let otherAgent = this.scene.getBusyGridState(
                  this.curDest.x,
                  this.curDest.y
               );
               if (this.isPrior && otherAgent.isPrior) {
                  this.isPrior = false;
                  this.setVelocity(0);
                  return;
               }
               if (!this.isPrior && otherAgent.isPrior) {
                  this.isPrior = true;
                  return;
               }
               if (!this.isPrior && !otherAgent.isPrior) {
                  this.isPrior = true;
                  return;
               }
               this.recalculatePath(
                  this.curSource?.x,
                  this.curSource?.y,
                  this.curDest
               );
            }
            return;
         }
         if (
            this.scene.getBusyGridState(this.curDest.x, this.curDest.y) == null
         ) {
            this.scene.setBusyGridState(this.curDest.x, this.curDest.y, this);
            return;
         }

         this.move();
      }
   }
}
export default AIEntity;
