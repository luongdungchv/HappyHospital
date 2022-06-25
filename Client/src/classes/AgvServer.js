import { Tilemaps } from "phaser";
import { Physics } from "phaser";
import { Text } from "./text";
import DynamicEntity from "./DynamicEntity";
import { ValidDestination } from "./Constants";

class AgvServer extends DynamicEntity {
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

      this.left = false;
      this.right = false;
      this.top = false;
      this.bottom = false;

      this.curTile = { x: x, y: y };
      scene.setBusyGridState(x, y, this);

      this.speed = 60;

      console.log(`dest: ${this.destX} ${this.destY}`);
   }
   update() {
      this.setVelocity(0);

      let t, l, b, r;
      t = true;
      l = true;
      b = true;
      r = true;

      if (this.keyW?.isDown && !this.top) {
         //  if (t) {
         //     this.body.velocity.y = -this.speed;
         //  }
         this.scene.socket.send("agv top");
         this.top = true;
      }

      if (this.keyA?.isDown && !this.left) {
         //  if (l) {
         //     this.body.velocity.x = -this.speed;
         //  }
         this.scene.socket.send("agv left");
         this.left = true;
      }

      if (this.keyS?.isDown && !this.bottom) {
         //  if (b) {
         //     this.body.velocity.y = this.speed;
         //  }
         this.scene.socket.send("agv bottom");
         this.bottom = true;
      }

      if (this.keyD?.isDown && !this.right) {
         //  if (r) {
         //     this.body.velocity.x = this.speed;
         //  }
         console.log("right click", this.right);
         this.scene.socket.send("agv right");
         this.right = true;
      }
      this.keyW?.isUp && (this.top = false);
      this.keyD?.isUp && (this.right = false);
      this.keyS?.isUp && (this.bottom = false);
      this.keyA?.isUp && (this.left = false);

      //console.log("right click", this.right);
      //   this.left = false;
      //   this.top = false;
      //   this.right = false;
      //   this.bottom = false;
      //   if (this.keyP?.isDown) this.scene.scene.pause();
      if (this.keyR?.isDown) this.scene.scene.resume();
   }
}
export default AgvServer;
