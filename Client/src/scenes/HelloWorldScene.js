import Phaser from "phaser";
import Agv from "../classes/agv";
import { Position } from "../classes/position";
import { secondsToHMS, ValidDestination } from "../classes/Constants";
import { calPathAstar } from "../classes/graph";
import Agent from "../classes/Agent";
import { calPathAstarGrid } from "../classes/graph";
import DynamicEntity from "../classes/DynamicEntity";
import AutoAgv from "../classes/AutoAgv";
import FullWindowRectangle from "phaser3-rex-plugins/plugins/fullwindowrectangle";
import AutoAgvServer from "../classes/AutoAgvProjection";
import AgentServer from "../classes/AgentServer";
import ServerEntity from "../classes/ServerEntity";
import AgvServer from "../classes/AgvServer";

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
      this.prob = 0.3;
      this.elapse = 0;

      this.agents = [];
      this.autoAgvs = [];
      this.busyGrid = [[]];
      this.harmfulness = 0;

      this.autoAgvIds = {};
      this.agentIds = {};

      this.autoAgvsServer = [];
      this.agentsServer = [];
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
         if (tileA.properties.direction == "top") {
            if (tileA.x == tileB.x && tileA.y == tileB.y + 1) {
               return true;
            }
         }
         if (tileA.properties.direction == "right") {
            if (tileA.x + 1 == tileB.x && tileA.y == tileB.y) {
               return true;
            }
         }
         if (tileA.properties.direction == "bottom") {
            if (tileA.x == tileB.x && tileA.y + 1 == tileB.y) {
               return true;
            }
         }
         if (tileA.properties.direction == "left") {
            if (tileA.x == tileB.x + 1 && tileA.y == tileB.y) {
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
         .dom(1790, 220)
         .createFromCache("setNumAgentForm");
      setNumAgentsDOM.addListener("click");
      setNumAgentsDOM.setPerspective(800);
      setNumAgentsDOM.on("click", (t) => {
         if (t.target.id === "submit") {
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
               this.prob = spawnProb;
               this.socket.send(`pr${spawnProb}`);
            }
            console.log(numAgent);
         }
      });

      this.timeTable = this.add.text(window.innerWidth - 200, 870, "", {
         color: "#D8202A",
         fontSize: "28px",
         fontStyle: "bold",
      });
      this.harmfulnessTable = this.add.text(
         window.innerWidth - 200,
         340,
         `H.ness: ${this.harmfulness}`,
         {
            padding: { bottom: 5, top: 5, left: 10, right: 10 },
            color: "white",
            fontSize: "24px",
            fontStyle: "bold",
         }
      );
   }
   updateHarmfulness() {
      console.log(this.harmfulness);
      this.harmfulnessTable.text = `H.ness: ${Math.floor(this.harmfulness)}`;
   }
   saveMap() {
      let data = {
         agv: {},
         agents: [],
         autoAgvs: [],
      };

      data.agv = {
         srcX: Math.round(this.agv.x / 32),
         srcY: Math.round(this.agv.y / 32),

         destX: this.agv.destX,
         destY: this.agv.destY,
      };
      console.log(this.agents.length);
      let c = 0;
      for (let j = 0; j < this.agentsServer.length; j++) {
         //console.log("loop");
         let i = this.agentsServer[j];
         if (!i) continue;
         console.log(this.agentsServer);
         if (!i.active) continue;
         if (!i.curPos) continue;
         data.agents.push({
            x: Math.floor(i.curPos.x),
            y: Math.floor(i.curPos.y),
            destX: i.dest.x,
            destY: i.dest.y,
            id: i.id,
         });
      }
      for (let i of this.autoAgvsServer) {
         if (!i.active) break;
         if (!i.curPos) break;
         data.autoAgvs.push({
            x: Math.floor(i.curPos.x),
            y: Math.floor(i.curPos.y),
            id: i.id,
            destX: i.dest.x,
            destY: i.dest.y,
         });
         //console.log(i.curPos);
      }
      // data.maxAgents = this.maxAgents;
      // data.spawnProb = this.prob;

      let arr = [[]];
      for (let i of this.pathLayer.layer.data) {
      }
      for (let j of this.pathLayer
         .getTilesWithin()
         .filter((v) => v.index != -1)) {
         if (!arr[j.x]) arr[j.x] = [];
         arr[j.x][j.y] = j.properties.direction || "";
      }

      let jsonData = JSON.stringify(data);
      console.log(jsonData);
      const e = document.createElement("a");
      e.setAttribute("href", "data:text/plain;charset=utf-8," + jsonData);
      e.setAttribute("download", "save.json");
      e.style.display = "none";
      document.body.appendChild(e);
      e.click();
      document.body.removeChild(e);
   }
   loadMap() {
      let data = {
         agv: {},
         agents: [],
         autoAgvs: [],
      };

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
                     let des = document.querySelector("#des");

                     des.innerHTML = "";

                     this.agentsServer.forEach((i) => i.eliminate());
                     this.agentsServer = [];
                     this.autoAgvsServer.forEach((i) => i.eliminate());
                     this.autoAgvsServer = [];
                     this.agv.eliminate();
                     this.agentIds = {};
                     this.autoAgvIds = {};

                     this.socket.send(reader?.result);

                     // this.socket.send(`aa${this.agents.length}`);
                     // console.log(data.maxAgents);
                     // data.maxAgents && this.socket.send(`ma${data.maxAgents}`);
                     // data.spawnProb && this.socket.send(`pr${data.spawnProb}`);
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
         //console.log("Message from server ", event.data);
         if (event.data == "Generate") {
            let r = Math.floor(Math.random() * this.doorPos.length);
            let pos = this.doorPos[r];
            this.agents.push(new Agent(this, pos.x, pos.y));
         } else if (event.data.includes("spawn")) {
            console.log(event.data);
            let cmdList = event.data.split(" ");
            if (cmdList[1] == "atagv") {
               let destX = parseInt(cmdList[3]);
               let destY = parseInt(cmdList[4]);
               let dest = { x: destX, y: destY };
               let src = {
                  x: parseInt(cmdList[5]),
                  y: parseInt(cmdList[6]),
               };
               let atagv = new AutoAgvServer(
                  this,
                  src.x,
                  src.y,
                  cmdList[2],
                  dest
               );
            } else if (cmdList[1] == "agent") {
               let x = parseInt(cmdList[3]);
               let y = parseInt(cmdList[4]);
               let destX = parseInt(cmdList[5]);
               let destY = parseInt(cmdList[6]);
               let dest = { x: destX, y: destY };

               let agent = new AgentServer(this, x, y, cmdList[2], dest);
            } else if (cmdList[1] == "agv") {
               let srcX = parseInt(cmdList[2]);
               let srcY = parseInt(cmdList[3]);
               let destX = parseInt(cmdList[4]);
               let destY = parseInt(cmdList[5]);
               let dest = { x: destX, y: destY };
               this.agv = new AgvServer(this, srcX, srcY, this.pathLayer, dest);
            }
         } else {
            this.autoAgvsServer.forEach((i) => i.notify(event.data));
            this.agentsServer.forEach((i) => i.notify(event.data));
            this.agv.notify(event.data);
         }
      });
   }
   startTimer() {
      this.timeText = this.add.text(window.innerWidth - 190, 290, "00:00:00", {
         color: "#D8202A",
         fontSize: "28px",
         fontStyle: "bold",
      });
      setInterval(() => {
         this.elapse++;
         this.timeText?.setText(secondsToHMS(this.elapse));
      }, 1000);
   }

   create() {
      const map = this.make.tilemap({
         key: "tilemap",
         tileHeight: 32,
         tileWidth: 32,
      });
      console.log(this.agents);
      //this.agentsServer.push(new DynamicEntity(this, 0, 1, "tile_sprites", 17));

      this.desDom = this.add.dom(1790, 600).createFromCache("des");
      this.desDom.setPerspective(800);

      this.createUI();
      this.startTimer();

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

      console.log(this.pathLayer);

      this.noPathLayer.setCollisionByProperty({ collides: true });

      this.generatePositions();
      this.createAdjacentList();

      this.groundPos.forEach((i) => {
         let [x, y] = [i.x, i.y];
         if (!this.busyGrid[x]) this.busyGrid[x] = [];
         this.busyGrid[x][y] = null;
      });

      //this.agv = new Agv(this, 1, 14, this.pathLayer);
      //this.agv = new AgvServer(this, 1, 13, this.pathLayer);
      //let a = new ServerEntity(this, 0, 1, "tile_sprites", 17);
      //this.atSetver = new AutoAgvServer(this, 1, 14, "2");

      // let spawnAutoAgvs = setInterval(() => {
      //    this.autoAgvs = this.autoAgvs.filter((i) => i && i.active);
      //    if (this.autoAgvs.length >= 5) {
      //       return;
      //    }
      //    this.autoAgvs.push(new AutoAgv(this, 1, 13));
      // }, 5000);
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
   update(time, delta) {
      this.agv?.update();
      this.autoAgvs.forEach((i) => i?.update());
      this.agents.forEach((i) => i?.update());
      this.autoAgvsServer.forEach((i) => i.update(delta));
      this.agentsServer.forEach((i) => i?.update());
   }
}
