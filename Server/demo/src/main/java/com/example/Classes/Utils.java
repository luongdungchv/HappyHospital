package com.example.Classes;

public class Utils {
    public static boolean ValidDest(Pos src, Pos dest) {
        if ((dest.x == 14 || dest.y == 13) && ((dest.y >= 0 && dest.x <= 5) || (dest.x >= 45 && dest.x <= 50))) {
            return false;
        }
        double d = Math.abs(dest.x - src.x) + Math.abs(dest.y - src.y);
        if (d < 5)
            return false;
        return false;
    }
}
