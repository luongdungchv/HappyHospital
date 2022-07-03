package com.example.Classes;

public class Pos {
    public int x;
    public int y;

    public Pos(int _x, int _y) {
        this.x = _x;
        this.y = _y;
    }

    public Pos() {

    }

    public boolean Equals(Pos input) {
        return (x == input.x && y == input.y);
    }
}
