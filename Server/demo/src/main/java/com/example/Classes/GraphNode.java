package com.example.Classes;

public class GraphNode {
    public Pos pos;
    public int g;
    public int h;
    public int f;
    public GraphNode prev;

    public GraphNode(int x, int y, int g, int h, GraphNode prev) {
        this.pos = new Pos(x, y);
        this.g = g;
        this.h = h;
        this.f = g + h;
        this.prev = prev;
    }
}