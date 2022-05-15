import { Tilemaps } from "phaser";
import { Physics } from "phaser";
import { Text } from "./text";
import { ValidDestination } from "./Constants";
import { calPathAstarGrid } from "./graph";

class DynamicEntity extends Physics.Arcade.Sprite {
   constructor(scene, x, y, name, frame) {
      super(scene, x * 32, y * 32, name, frame);

      scene.add.existing(this);
      scene.physics.add.existing(this);
      this.scene = scene;
      //this.setCollideWorldBounds(true);
      this.setSize(32, 32);
      this.setOrigin(0, 0);
   }

   update() {}
   changeDest(x, y) {}
   eliminate() {
      this.desText?.destroy();
      this.displayText?.destroy();
      this?.destroy();
   }
}
export default DynamicEntity;
