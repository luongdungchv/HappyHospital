package com.example.Classes;

public class Agent extends AIEntity {

    public Agent(int x, int y, int id) {
        this.curSrc = new Pos(x, y);
        this.id = id;
    }
}
