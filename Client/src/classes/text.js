import { GameObjects, Scene } from "phaser";

export class Text extends GameObjects.Text {
   constructor(scene, x, y, text, fontSize = "16px", color) {
      super(scene, x, y, text, {
         fontSize: fontSize,
         color: color ? color : "#fff",
         stroke: "#000",
         strokeThickness: 4,
      });
      this.setOrigin(0, 0);
      this.setDepth(1);
      scene.add.existing(this);
   }
}
