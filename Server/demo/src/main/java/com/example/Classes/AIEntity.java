package com.example.Classes;

import java.util.Stack;

public class AIEntity extends Entity {
    public Stack<GraphNode> movePath;
    public String id;
    public Pos finalDest;

    public Stack<GraphNode> CalculatePath(Pos start, Pos end) {
        return null;
    }

    public int GetIdNum() {
        return Integer.parseInt(id.substring(5));
    }
}
