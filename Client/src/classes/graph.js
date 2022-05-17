class GraphNode {
   constructor(x, y, g, h, pV) {
      this.x = x;
      this.y = y;
      this.g = g;
      this.h = h;
      this.f = g + h;
      this.pV = pV;
   }
}
class Cell {
   constructor(x, y) {
      this.x = x;
      this.y = y;
      this.movable = false;
   }
}

let busyGrid = [[]];
const generateNodeList = (groundPos) => {
   groundPos.forEach((i) => {
      let [x, y] = [i.x, i.y];
      if (!busyGrid[x]) busyGrid[x] = [];
      busyGrid[x][y] = false;
   });
};
const setBusy = (x, y, state) => {
   busyGrid[x][y] = state;
};
const calPathAstar = (adjacentList, start, end) => {
   let openList = [];
   let closedList = [];
   let result = [];
   openList.push(
      new GraphNode(
         start.x,
         start.y,
         0,
         Math.abs(start.y - end.y) + Math.abs(start.x - end.x),
         null
      )
   );
   while (openList.length > 0) {
      let smallestF = openList[0].f;
      let currentNode = openList[0];
      for (let i of openList) {
         if (i.f < smallestF) {
            smallestF = i.f;
            currentNode = i;
         }
      }
      let [x, y] = [currentNode.x, currentNode.y];
      if (!adjacentList[x]) {
         openList.splice(openList.indexOf(currentNode), 1);
         closedList.push(currentNode);
         continue;
      }
      for (let i of adjacentList[x][y]) {
         let [nodeX, nodeY] = [i.x, i.y];
         if (closedList.findIndex((i) => i.x === nodeX && i.y === nodeY) != -1)
            continue;
         let nodeG = currentNode.g + 1;
         let nodeH = Math.abs(nodeY - end.y) + Math.abs(nodeX - end.x);
         if (nodeH === 0) {
            result.push(end);
            while (currentNode) {
               result.push(currentNode);
               currentNode = currentNode.pV;
            }
            return result;
         }
         openList.push(new GraphNode(nodeX, nodeY, nodeG, nodeH, currentNode));
      }
      openList.splice(openList.indexOf(currentNode), 1);
      closedList.push(currentNode);
   }
};
const calPathAstarGrid = (width, height, movableCells, start, end, id) => {
   const getNeighbor = (x, y) => {
      let check = x == start.x && y == start.y;
      let res = check
         ? [
              { x: x, y: y + 1 },
              { x: x, y: y - 1 },
              { x: x + 1, y: y },
              { x: x - 1, y: y },
           ]
         : [
              { x: x + 1, y: y + 1 },
              { x: x, y: y + 1 },
              { x: x + 1, y: y - 1 },
              { x: x, y: y - 1 },
              { x: x + 1, y: y },
              { x: x - 1, y: y },
              { x: x - 1, y: y - 1 },
              { x: x - 1, y: y + 1 },
           ];

      start.x && y == start.y && id == 24 && console.log(start);
      return res.filter(
         (i) => i.x >= 0 && i.x < width && i.y >= 0 && i.y < height
      );
   };
   let grid = [[]];
   for (let i = 0; i < width; i++) {
      if (!grid[i]) grid[i] = [];
      for (let j = 0; j < height; j++) {
         grid[i][j] = new Cell(i, j);
      }
   }
   for (let i of movableCells) {
      grid[i.x][i.y].movable = true;
   }

   //console.log(grid);

   let openList = [];
   let closedList = [];
   let result = [];
   openList.push(
      new GraphNode(
         start.x,
         start.y,
         0,
         Math.abs(start.y - end.y) + Math.abs(start.x - end.x),
         null
      )
   );

   while (openList.length > 0) {
      let smallestF = openList[0].f;
      let currentNode = openList[0];
      for (let i of openList) {
         if (i.f < smallestF) {
            smallestF = i.f;
            currentNode = i;
         }
      }
      let [x, y] = [currentNode.x, currentNode.y];
      for (let i of getNeighbor(x, y)) {
         let [newX, newY, newG, newH] = [
            i.x,
            i.y,
            currentNode.g +
               (i.x != currentNode.x && i.y != currentNode.y ? 1.4 : 1),
            Math.abs(end.y - i.y) + Math.abs(end.x - i.x),
         ];
         if (grid[newX][newY].movable == false) continue;
         if (closedList.findIndex((i) => i.x == newX && i.y == newY) != -1)
            continue;
         const newNodeIndex = openList.findIndex(
            (i) => i.x == newX && i.y == newY
         );
         if (newNodeIndex != -1) {
            let node = openList[newNodeIndex];
            if (node.f > newG + newH) {
               openList[newNodeIndex] = new GraphNode(
                  newX,
                  newY,
                  newG,
                  newH,
                  currentNode
               );
            }
            continue;
         }
         if (newH === 0) {
            result.push(end);
            while (currentNode) {
               result.push(currentNode);
               currentNode = currentNode.pV;
            }
            return result;
         }
         let newNode = new GraphNode(newX, newY, newG, newH, currentNode);
         openList.push(newNode);
      }
      openList.splice(openList.indexOf(currentNode), 1);
      closedList.push(currentNode);
   }
};

export { calPathAstar, calPathAstarGrid };
