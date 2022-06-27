package com.example.Classes;

public class PosFloat {
    public double x;
    public double y;

    public PosFloat(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public PosFloat(Pos input) {
        this.x = input.x;
        this.y = input.y;
    }

    public static PosFloat Add(PosFloat elem1, PosFloat elem2) {
        return new PosFloat(elem1.x + elem2.x, elem1.y + elem2.y);
    }

    public static PosFloat Minus(PosFloat elem1, PosFloat elem2) {
        return new PosFloat(elem1.x - elem2.x, elem1.y - elem2.y);
    }

    public static PosFloat Inverse(PosFloat elem) {
        return new PosFloat(-elem.x, -elem.y);
    }

    public Pos Floor() {
        return new Pos((int) Math.floor(x), (int) Math.floor(y));
    }

    public void ResolveApproximation() {
        Pos ceiledPos = Ceil();
        Pos flooredPos = Floor();

        if (ceiledPos.x - x <= 0.000000001)
            x = ceiledPos.x;
        if (ceiledPos.y - y <= 0.000000001)
            y = ceiledPos.y;

        if (x - flooredPos.x <= 0.000000001)
            x = flooredPos.x;
        if (y - flooredPos.y <= 0.000000001)
            y = flooredPos.y;
    }

    public Pos Ceil() {
        // return new Pos( Math.ceil(x * 10000) / 10000, (int) Math.ceil(y * 10000) /
        // 10000);
        double ceiledX = Double.parseDouble((Double.toString(x + 0.000000001) + "0000").substring(0, 5));
        double ceiledY = Double.parseDouble((Double.toString(y + 0.000000001) + "0000").substring(0, 5));

        return new Pos((int) Math.ceil(ceiledX), (int) Math.ceil(ceiledY));
    }

    public PosFloat ToOne() {
        double newX = x != 0 ? x / Math.abs(x) : 0;
        double newY = y != 0 ? y / Math.abs(y) : 0;
        return new PosFloat(newX, newY);
    }

    public Pos ToPosInt() {
        return new Pos((int) x, (int) y);
    }

    public boolean IsZero() {
        return (x == 0 && y == 0);
    }

    public boolean IsDiagonal() {
        return (x != 0 && y != 0);
    }

}
