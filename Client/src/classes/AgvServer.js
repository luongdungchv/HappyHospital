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
         this.updateDestText();
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
   notify(msg) {
      let cmdList = msg.split(" ");
      if (cmdList[0] == "agv") {
         if (cmdList[1] !== "dest") {
            let x = parseFloat(cmdList[1]);
            let y = parseFloat(cmdList[2]);
            this.setPosition(x * 32, y * 32);
         } else {
            this.desText.destroy();
            this.destX = parseInt(cmdList[2]);
            this.destY = parseInt(cmdList[3]);
            this.updateDestText();
         }
      }
   }
   updateDestText() {
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
      if (!this.active) {
         delete this;
         return;
      }
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
         this.scene.socket.send("agv top d");
         this.top = true;
      }

      if (this.keyA?.isDown && !this.left) {
         //  if (l) {
         //     this.body.velocity.x = -this.speed;
         //  }
         this.scene.socket.send("agv left d");
         this.left = true;
      }

      if (this.keyS?.isDown && !this.bottom) {
         //  if (b) {
         //     this.body.velocity.y = this.speed;
         //  }
         this.scene.socket.send("agv bottom d");
         this.bottom = true;
      }

      if (this.keyD?.isDown && !this.right) {
         //  if (r) {
         //     this.body.velocity.x = this.speed;
         //  }
         console.log("right click", this.right);
         this.scene.socket.send("agv right d");
         this.right = true;
      }
      if (this.keyW?.isUp && this.top) {
         this.scene.socket.send("agv top u");
         this.top = false;
      }
      if (this.keyA?.isUp && this.left) {
         this.scene.socket.send("agv left u");
         this.left = false;
      }
      if (this.keyD?.isUp && this.right) {
         this.scene.socket.send("agv right u");
         this.right = false;
      }
      if (this.keyS?.isUp && this.bottom) {
         this.scene.socket.send("agv bottom u");
         this.bottom = false;
      }

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
