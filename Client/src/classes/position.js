export class Position {
   constructor(x, y) {
      this.x = x;
      this.y = y;
   }

   static between(x, y) {
      return Math.sqrt((x.x - y.x) ** 2 + (x.y - y.y) ** 2);
   }
}
