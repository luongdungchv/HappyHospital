import Phaser from "phaser";
import Agv from "../classes/agv";
import { Position } from "../classes/position";
import { ValidDestination } from "../classes/Constants";
import { calPathAstar } from "../classes/graph";
import Agent from "../classes/Agent";
import { calPathAstarGrid } from "../classes/graph";
import DynamicEntity from "../classes/DynamicEntity";
import AutoAgv from "../classes/AutoAgv";
import FullWindowRectangle from "phaser3-rex-plugins/plugins/fullwindowrectangle";

export default class HelloWorldScene extends Phaser.Scene {
   constructor() {
      super("hello-world");
      this.adjacentList = [[[]]];
      this.pathPos = [];
      this.groundPos = [];
      this.doorPos = [];
      this.elevatorPos = [];
      this.gatePos = [];
      this.maxAgents = 5;

      this.agents = [];
      this.autoAgvs = [];
      this.busyGrid = [[]];
      this.harmfulness = 0;
   }
   setBusyGridState(x, y, state) {
      if (!x || !y) return;
      this.busyGrid[x][y] = state;
   }
   getBusyGridState(x, y) {
      return this.busyGrid[x][y];
   }
   checkTilesUndirection(tileA, tileB) {
      if (tileA.x == tileB.x && tileA.y == tileB.y + 1) {
         if (
            tileB.properties.direction == "top" ||
            !tileB.properties.direction
         ) {
            return true;
         }
      }
      if (tileA.x + 1 == tileB.x && tileA.y == tileB.y) {
         if (
            tileB.properties.direction == "right" ||
            !tileB.properties.direction
         ) {
            return true;
         }
      }
      if (tileA.x == tileB.x && tileA.y + 1 == tileB.y) {
         if (
            tileB.properties.direction == "bottom" ||
            !tileB.properties.direction
         ) {
            return true;
         }
      }
      if (tileA.x == tileB.x + 1 && tileA.y == tileB.y) {
         if (
            tileB.properties.direction == "left" ||
            !tileB.properties.direction
         ) {
            return true;
         }
      }
      return false;
   }

   checkNeighbor(tileA, tileB) {
      if (!tileA.properties.direction) {
         if (this.checkTilesUndirection(tileA, tileB)) return true;
      } else {
         // neu o dang xet co huong
         if (tileA.properties.direction == "top") {
            if (tileA.x == tileB.x && tileA.y == tileB.y + 1) {
               /*&& tileA.properties.direction != "bottom"*/
               return true;
            }
         }
         if (tileA.properties.direction == "right") {
            if (tileA.x + 1 == tileB.x && tileA.y == tileB.y) {
               /*&& tileA.properties.direction != "left"*/
               return true;
            }
         }
         if (tileA.properties.direction == "bottom") {
            if (tileA.x == tileB.x && tileA.y + 1 == tileB.y) {
               /*&& tileA.properties.direction != "top") {*/
               return true;
            }
         }
         if (tileA.properties.direction == "left") {
            if (tileA.x == tileB.x + 1 && tileA.y == tileB.y) {
               /*&& tileA.properties.direction != "right") {*/
               return true;
            }
         }
      }
      return false;
   }
   createAdjacentList() {
      let tiles = [];
      this.pathLayer
         .getTilesWithin()
         .filter((v) => v.index != -1)
         .forEach((v) => {
            tiles.push(v);
         });
      for (let i = 0; i < tiles.length; i++) {
         for (let j = 0; j < tiles.length; j++) {
            if (i != j) {
               if (this.checkNeighbor(tiles[i], tiles[j])) {
                  let x = tiles[i].x;
                  let y = tiles[i].y;
                  if (!this.adjacentList[tiles[i].x])
                     this.adjacentList[tiles[i].x] = [[]];
                  if (!this.adjacentList[tiles[i].x][tiles[i].y])
                     this.adjacentList[tiles[i].x][tiles[i].y] = [];
                  this.adjacentList[tiles[i].x][tiles[i].y].push(
                     new Position(tiles[j].x, tiles[j].y)
                  );
               }
            }
         }
      }
   }

   generatePositions() {
      this.pathLayer
         .getTilesWithin()
         .filter((v) => v.index != -1)
         .forEach((v) => {
            const pos = new Position(v.x, v.y);
            this.pathPos.push(pos);
         });
      this.groundLayer
         .getTilesWithin()
         .filter((v) => v.index != -1)
         .forEach((v) => {
            const pos = new Position(v.x, v.y);
            v.setAlpha(0);
            this.groundPos.push(pos);
         });
      this.doorLayer
         .getTilesWithin()
         .filter((v) => v.index != -1)
         .forEach((v) => {
            const pos = new Position(v.x, v.y);
            this.doorPos.push(pos);
         });
      this.elevatorLayer
         .getTilesWithin()
         .filter((v) => v.index != -1)
         .forEach((v) => {
            const pos = new Position(v.x, v.y);
            this.elevatorPos.push(pos);
         });
      this.gateLayer
         .getTilesWithin()
         .filter((v) => v.index != -1)
         .forEach((v) => {
            const pos = new Position(v.x, v.y);
            this.doorPos.push(pos);
         });
   }
   preload() {
      this.load.image({
         key: "tiles",
         url: "assets/tilemaps/tiles/hospital.png",
      });
      this.load.tilemapTiledJSON(
         "tilemap",
         "assets/tilemaps/json/hospital.json"
      );
      this.load.image("agv", "assets/sprites/agv.png");
      this.load.spritesheet(
         "tile_sprites",
         "assets/tilemaps/tiles/hospital.png",
         {
            frameWidth: 32,
            frameHeight: 32,
         }
      );
      this.load.html("setNumAgentForm", "assets/setNumAgents.html");
      this.load.html("des", "assets/des.html");
   }
   createUI() {
      let setNumAgentsDOM = this.add
         .dom(1770, 220)
         .createFromCache("setNumAgentForm");
      setNumAgentsDOM.addListener("click");
      setNumAgentsDOM.setPerspective(800);
      setNumAgentsDOM.on("click", (t) => {
         if (t.target.id === "submit") {
            // //var input = setNumAgentsDOM.getChildByName("numOfAgents")
            let numAgent = parseInt(
               setNumAgentsDOM.getChildByName("numOfAgents").value
            );
            let spawnProb = parseFloat(
               setNumAgentsDOM.getChildByName("agentSpawnProb").value
            );

            if (!isNaN(numAgent) && numAgent > 0) {
               this.maxAgents = numAgent;
               this.socket.send(`ma${numAgent}`);
            }
            if (!isNaN(spawnProb) && spawnProb > 0) {
               this.maxAgents = numAgent;
               this.socket.send(`pr${spawnProb}`);
            }
            console.log(numAgent);
         }
      });

      this.timeTable = this.add.text(window.innerWidth - 1910, 870, "", {
         color: "#D8202A",
         fontSize: "28px",
         fontStyle: "bold",
      });
      this.harmfulnessTable = this.add.text(
         window.innerWidth - 200,
         340,
         `${this.harmfulness}`,
         {
            //backgroundColor: "#eee",
            padding: { bottom: 5, top: 5, left: 10, right: 10 },
            color: "white",
            fontSize: "24px",
            fontStyle: "bold",
         }
      );
   }
   updateHarmfulness() {
      this.harmfulnessTable.text = `${Math.floor(this.harmfulness)}`;
   }
   saveMap() {
      let data = {
         agents: [],
         autoAgvs: [],
      };
      for (let i of this.agents) {
         if (!i.active) return;
         if (!i.curSource) return;
         data.agents.push({
            x: i.curSource.x,
            y: i.curSource.y,
            index: i.destIndex,
            id: i.id,
         });
         console.log(i.curSource);
      }
      for (let i of this.autoAgvs) {
         if (!i.active) return;
         if (!i.curSource) return;
         data.autoAgvs.push({
            x: i.curSource.x,
            y: i.curSource.y,
            id: i.index,
            dest: { x: i.destX, y: i.destY },
         });
         console.log(i.curSource);
      }
      let jsonData = JSON.stringify(data);
      const e = document.createElement("a");
      e.setAttribute(
         "href",
         // "data:text/plain;charset=utf-8," + encodeURIComponent(text)
         "data:text/plain;charset=utf-8," + jsonData
      );
      e.setAttribute("download", "save.json");
      e.style.display = "none";
      document.body.appendChild(e);
      e.click();
      document.body.removeChild(e);
   }
   loadMap() {
      let data = {
         agents: [],
         autoAgvs: [],
      };
      //this.scene.restart();

      const e = document.createElement("input");
      const reader = new FileReader();
      const openFile = (event) => {
         var input = event.target;
         var fileTypes = "json";
         if (input.files && input.files[0]) {
            var extension = input.files[0].name.split(".").pop().toLowerCase(),
               isSuccess = fileTypes.indexOf(extension) > -1;

            if (isSuccess) {
               reader.onload = () => {
                  if (typeof reader?.result == "string") {
                     data = JSON.parse(reader?.result);

                     this.agents.forEach((i) => i.eliminate());
                     this.agents = [];
                     this.autoAgvs.forEach((i) => i.eliminate());
                     this.autoAgvs = [];

                     this.groundPos.forEach((i) => {
                        let [x, y] = [i.x, i.y];
                        if (!this.busyGrid[x]) this.busyGrid[x] = [];
                        this.busyGrid[x][y] = null;
                     });

                     data.agents.forEach((i) => {
                        this.agents.push(
                           new Agent(this, i.x, i.y, i.index, i.id)
                        );
                     });
                     data.autoAgvs.forEach((i) => {
                        this.autoAgvs.push(
                           new AutoAgv(this, i.x, i.y, i.id, i.dest)
                        );
                     });
                     this.socket.send(`aa${this.agents.length}`);

                     // console.log(this.mapData);
                     //alert("Đã tải map thành công!");
                  }
               };
               reader.readAsText(input.files[0]);
            } else {
               alert("File không đúng định dạng. Vui lòng chọn file .json!");
            }
         }
      };
      e.type = "file";
      e.style.display = "none";
      e.addEventListener("change", openFile, false);
      document.body.appendChild(e);
      e.click();
      document.body.removeChild(e);
   }
   addSaveLoadBtn() {
      this.saveButton = this.add.text(
         window.innerWidth - 200,
         50,
         "Save data",
         {
            backgroundColor: "#eee",
            padding: { bottom: 5, top: 5, left: 10, right: 10 },
            color: "#000",
            fontSize: "24px",
            fontStyle: "bold",
         }
      );
      this.loadButton = this.add.text(
         window.innerWidth - 200,
         110,
         "Load data",
         {
            backgroundColor: "#eee",
            padding: { bottom: 5, top: 5, left: 10, right: 10 },
            color: "#000",
            fontSize: "24px",
            fontStyle: "bold",
         }
      );

      this.saveButton.setInteractive().on("pointerdown", () => this.saveMap());
      this.loadButton.setInteractive().on("pointerdown", () => this.loadMap());
   }
   establishSocket() {
      const socket = new WebSocket("ws://localhost:8025/websockets/toUpper");
      this.socket = socket;
      socket.addEventListener("open", function (event) {
         socket.send("Hello Server!");
      });

      socket.addEventListener("message", (event) => {
         console.log("Message from server ", event.data);
         if (event.data == "Generate") {
            // if (this.agents.length >= this.maxAgents) {
            //    return;
            // }
            let r = Math.floor(Math.random() * this.doorPos.length);
            let pos = this.doorPos[r];
            this.agents.push(new Agent(this, pos.x, pos.y));
         }
      });
   }

   create() {
      const map = this.make.tilemap({
         key: "tilemap",
         tileHeight: 32,
         tileWidth: 32,
      });
      console.log(this.agents);

      this.desDom = this.add.dom(1770, 600).createFromCache("des");
      this.desDom.setPerspective(800);

      this.createUI();

      let tileset = map.addTilesetImage("hospital", "tiles");
      this.noPathLayer = map.createLayer("nopath", tileset, 0, 0);
      this.groundLayer = map.createLayer("ground", tileset, 0, 0);
      map.createLayer("room", tileset, 0, 0);
      map.createLayer("wall", tileset, 0, 0);
      this.pathLayer = map.createLayer("path", tileset, 0, 0);
      this.doorLayer = map.createLayer("door", tileset, 0, 0);
      this.elevatorLayer = map.createLayer("elevator", tileset, 0, 0);
      this.gateLayer = map.createLayer("gate", tileset, 0, 0);
      map.createLayer("bed", tileset, 0, 0);

      this.noPathLayer.setCollisionByProperty({ collides: true });

      this.generatePositions();
      this.createAdjacentList();

      this.groundPos.forEach((i) => {
         let [x, y] = [i.x, i.y];
         if (!this.busyGrid[x]) this.busyGrid[x] = [];
         this.busyGrid[x][y] = null;
      });

      this.agv = new Agv(this, 1, 14, this.pathLayer);

      let collider = this.physics.add.collider(this.agv, this.noPathLayer);

      let spawnAutoAgvs = setInterval(() => {
         if (this.autoAgvs.length >= 5) {
            //clearInterval(spawnAutoAgvs);
            return;
         }
         this.autoAgvs.push(new AutoAgv(this, 1, 13, this.autoAgvs.length));
      }, 5000);
      this.addSaveLoadBtn();
      this.establishSocket();
      // let spawnAgents = setInterval(() => {
      //    console.log(this.maxAgents);
      //    if (this.agents.length >= this.maxAgents) {
      //       return;
      //    }
      //    let rand = Math.random();
      //    if (rand < 0.3) {
      //       let r = Math.floor(Math.random() * this.gatePos.length);
      //       let pos = this.gatePos[r];
      //       this.agents.push(new Agent(this, pos.x, pos.y));
      //    }
      // }, 1000);
   }
   update() {
      this.agv.update();
      this.autoAgvs.forEach((i) => i?.update());
      this.agents.forEach((i) => i?.update());
   }
}
