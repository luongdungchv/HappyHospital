package com.example;

public class Model {

}

public class Pos {
    public int x;
    public int y;

    public Pos(int _x, int _y) {
        this.x = _x;
        this.y = _y;
    }
}

public class AdjacentListModel extends Model {

}

public class PosModel extends Model {
    public List<Pos> posList = new List<Pos>();

    public PosModel() {
        posList.add(new Pos(1, 1));
        posList.add(new Pos(2, 1));
        posList.add(new Pos(3, 1));
        posList.add(new Pos(4, 1));
    }
}
