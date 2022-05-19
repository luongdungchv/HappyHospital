import { Tilemaps } from "phaser";
import { Physics } from "phaser";
import { Text } from "./text";
import DynamicEntity from "./DynamicEntity";
import { ValidDestination } from "./Constants";

class Agv extends DynamicEntity {
   constructor(scene, x, y, pathLayer, dest) {
      super(scene, x, y, "agv");

      scene.physics.add.collider(this, scene.noPathLayer);

      this.scene = scene;

      this.pathLayer = pathLayer;

      if (dest) {
         this.destX = dest.x;
         this.destY = dest.y;
         this.desText = new Text(
            this.scene,
            this.destX * 32,
            this.destY * 32,
            "DES",
            "16px",
            "#00FF00"
         );
      } else {
         this.changeDest();
      }

      this.keyW = this.scene.input.keyboard.addKey("W");
      this.keyA = this.scene.input.keyboard.addKey("A");
      this.keyS = this.scene.input.keyboard.addKey("S");
      this.keyD = this.scene.input.keyboard.addKey("D");
      this.keyP = this.scene.input.keyboard.addKey("P");
      this.keyR = this.scene.input.keyboard.addKey("R");

      this.curTile = { x: x, y: y };
      scene.setBusyGridState(x, y, this);

      this.speed = 60;

      console.log(`dest: ${this.destX} ${this.destY}`);
   }
   getTilesWithin() {
      return this.pathLayer.getTilesWithinWorldXY(this.x, this.y, 31, 31);
   }
   changeDest() {
      let r = Math.floor(Math.random() * this.scene.pathPos.length);
      while (
         !ValidDestination(
            this.scene.pathPos[r].x,
            this.scene.pathPos[r].y,
            1,
            14
         )
      ) {
         r = Math.floor(Math.random() * this.scene.pathPos.length);
      }

      this.destX = this.scene.pathPos[r].x;
      this.destY = this.scene.pathPos[r].y;
      this.desText = new Text(
         this.scene,
         this.destX * 32,
         this.destY * 32,
         "DES",
         "16px",
         "#00FF00"
      );
   }

   update() {
      this.setVelocity(0);

      let t, l, b, r;
      t = true;
      l = true;
      b = true;
      r = true;

      let tiles = this.getTilesWithin();
      console.log(tiles.length);
      if (
         tiles.length == 1 &&
         (tiles[0].x != this.curTile.x || tiles[0].y != this.curTile.y)
      ) {
         this.scene.setBusyGridState(this.curTile.x, this.curTile.y, null);
         this.curTile = { x: tiles[0].x, y: tiles[0].y };
         this.scene.setBusyGridState(this.curTile.x, this.curTile.y, this);
      }
      for (let i = 0; i < tiles.length; i++) {
         if (
            this.scene.getBusyGridState(tiles[i].x, tiles[i].y) &&
            this.scene.getBusyGridState(tiles[i].x, tiles[i].y) != this
         ) {
            return;
         }
         if (tiles[i].x == this.destX && tiles[i].y == this.destY) {
            this.desText?.destroy();
            this.changeDest();
         }
         if (
            this.scene.getBusyGridState(tiles[i].x, tiles[i].y) != null &&
            this.scene.getBusyGridState(tiles[i].x, tiles[i].y) != this
         ) {
            this.setVelocity(0);

            return;
         }
         if (tiles[i].properties.direction == "top") {
            b = false;
            if (this.keyS?.isDown) {
            }
         }
         if (tiles[i].properties.direction == "left") {
            r = false;
            if (this.keyD?.isDown) {
            }
         }
         if (tiles[i].properties.direction == "bottom") {
            t = false;
            if (this.keyW?.isDown) {
            }
         }
         if (tiles[i].properties.direction == "right") {
            l = false;
            if (this.keyA?.isDown) {
            }
         }
      }

      if (this.keyW?.isDown) {
         if (t) {
            this.body.velocity.y = -this.speed;
         }
      }

      if (this.keyA?.isDown) {
         if (l) {
            this.body.velocity.x = -this.speed;
         }
      }

      if (this.keyS?.isDown) {
         if (b) {
            this.body.velocity.y = this.speed;
         }
      }

      if (this.keyD?.isDown) {
         if (r) {
            this.body.velocity.x = this.speed;
         }
      }
      if (this.keyP?.isDown) this.scene.scene.pause();
      if (this.keyR?.isDown) this.scene.scene.resume();
   }
}
export default Agv;
