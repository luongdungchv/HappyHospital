import Phaser from "phaser";

import HelloWorldScene from "./scenes/HelloWorldScene";
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

const config = {
   title: "Happy Hospital",
   type: Phaser.WEBGL,
   parent: "game",
   backgroundColor: "#777",
   dom: {
      createContainer: true,
   },
   scale: {
      mode: Phaser.Scale.ScaleModes.NONE,
      width: window.innerWidth,
      height: window.innerHeight,
   },
   physics: {
      default: "arcade",
      arcade: {
         debug: false,
      },
   },
   render: {
      antialiasGL: false,
      pixelArt: true,
   },
   callbacks: {
      postBoot: () => {
         sizeChanged();
      },
   },
   canvasStyle: `display: block; width: 100%; height: 100%;`,
   autoFocus: true,
   audio: {
      disableWebAudio: false,
   },
   scene: [HelloWorldScene],
   plugins: {
      scene: [
         {
            key: "rexUI",
            plugin: UIPlugin,
            mapping: "rexUI",
         },
      ],
   },
};
let game;
const sizeChanged = () => {
   if (game.isBooted) {
      setTimeout(() => {
         game.scale.resize(window.innerWidth, window.innerHeight);

         game.canvas.setAttribute(
            "style",
            `display: block; width: ${window.innerWidth}px; height: ${window.innerHeight}px;`
         );
      }, 100);
   }
};

window.onresize = () => sizeChanged();

game = new Phaser.Game(config);
