package com.example.Classes;

import java.util.TimerTask;

public class Agv extends Entity {
    private String dir;

    public Agv(int x, int y) {
        this.curSrc = new Pos(x, y);
    }

    class MoveSchedule extends TimerTask {
        public void run() {
            if (dir == null || dir.equals("")) {

            }

        }
    }
}
