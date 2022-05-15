export function ValidDestination(destX, destY, x, y) {
   if (
      (destY == 14 || destY == 13) &&
      ((destX >= 0 && destX <= 5) || (destX >= 45 && destX <= 50))
   )
      return false;
   var d = Math.sqrt((destX - x) ** 2 + (destY - y) ** 2);
   if (d * 32 < 10) return false;
   return true;
}
export function secondsToHMS(seconds) {
   var h = Math.floor((seconds % (3600 * 24)) / 3600);
   var m = Math.floor((seconds % 3600) / 60);
   var s = Math.floor(seconds % 60);

   var hDisplay = h >= 10 ? h : "0" + h;
   var mDisplay = m >= 10 ? m : "0" + m;
   var sDisplay = s >= 10 ? s : "0" + s;
   return hDisplay + ":" + mDisplay + ":" + sDisplay;
}
