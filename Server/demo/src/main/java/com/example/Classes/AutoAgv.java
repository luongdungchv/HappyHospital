package com.example.Classes;

import com.example.App;
import com.example.Game;
import java.util.List;
import java.util.Stack;
import java.util.Timer;
import java.util.TimerTask;
import java.util.ArrayList;

public class AutoAgv extends AIEntity {
    public Stack<GraphNode> movePath;
    public Pos finalDest;

    public AutoAgv(int x, int y) {

        this.curSrc = new Pos(x, y);

        int id = (int) Math.floor(Math.random() * 9);
        while (Game.getInstance().GetAtAgvIdState(id)) {
            id = (int) Math.floor(Math.random() * 10);
        }
        Game.getInstance().SetAtAgvIdState(id, true);
        this.id = String.format("atagv%d", id);
        // System.out.println("atagv created " + this.id);
        Game.getInstance().AddAtAgv(this.id, this);
        CalculateRandomPath();
        App.SendText(String.format("spawn atagv %s %d %d %d %d", this.id, this.finalDest.x, this.finalDest.y, x, y));

        timer = new Timer();
        TimerTask task = new MoveSchedule();
        timer.schedule(task, 0, 500);

        // this.curDest = pathPos[randomIndex];
    }

    public AutoAgv(int x, int y, int x1, int y1, String id) {
        this.curSrc = new Pos(x, y);
        this.movePath = CalculatePath(curSrc, new Pos(x1, y1));

        this.id = id;
        String[] split = id.split("v");
        Game.getInstance().SetAtAgvIdState(Integer.parseInt(split[1]), true);
        Game.getInstance().AddAtAgv(this.id, this);
        this.finalDest = new Pos(x1, y1);
        if (this.movePath != null)
            this.curDest = movePath.peek().pos;
        else
            CalculateRandomPath();

        App.SendText(String.format("spawn atagv %s %d %d %d %d", this.id, this.finalDest.x, this.finalDest.y, x, y));

        timer = new Timer();
        TimerTask task = new MoveSchedule();
        timer.schedule(task, 0, 500);
    }

    private void CalculateRandomPath() {
        Pos[] pathPos = Game.getInstance().pathPos;
        int randomIndex = (int) Math.floor(Math.random() * pathPos.length);

        while (!Utils.ValidDest(this.curSrc, pathPos[randomIndex])) {
            randomIndex = (int) Math.floor(Math.random() * pathPos.length);
        }
        this.finalDest = pathPos[randomIndex];

        // System.out.println(String.format("finalDest %d %d", finalDest.x,
        // finalDest.y));
        this.movePath = CalculatePath(curSrc, finalDest);
        if (movePath != null) {
            this.curDest = movePath.peek().pos;
        }

    }

    public Stack<GraphNode> CalculatePath(Pos start, Pos end) {
        Game game = Game.getInstance();
        List<GraphNode> open = new ArrayList<GraphNode>();
        List<GraphNode> close = new ArrayList<GraphNode>();
        open.add(new GraphNode(start.x, start.y, 0, Math.abs(end.x - start.x) + Math.abs(end.y - start.y), null));
        while (open.size() > 0) {
            GraphNode curNode = open.get(0);
            int smallestF = curNode.f;
            for (GraphNode i : open) {
                if (i.f < smallestF) {
                    curNode = i;
                    smallestF = i.f;
                }
            }
            if (curNode.pos.x >= 50 || curNode.pos.y >= 27) {
                open.remove(curNode);
                continue;
            }
            Pos[] listPos = game.adjacentList[curNode.pos.x][curNode.pos.y];
            for (Pos i : game.adjacentList[curNode.pos.x][curNode.pos.y]) {

                boolean canContinue = false;
                for (GraphNode node : close) {
                    if (node.pos.x == i.x && node.pos.y == i.y) {
                        canContinue = true;
                        break;
                    }
                }
                for (GraphNode node : open) {
                    if (node.pos.x == i.x && node.pos.y == i.y) {
                        canContinue = true;
                        break;
                    }
                }
                if (canContinue) {
                    // System.out.println("continue");
                    continue;
                }
                int g = curNode.g + 1;
                int h = Math.abs(end.x - i.x) + Math.abs(end.y - i.y);
                if (h == 0) {
                    Stack<GraphNode> path = new Stack<GraphNode>();
                    // path.push(curNode);
                    path.push(new GraphNode(i.x, i.y, g, h, curNode));
                    while (curNode != null) {
                        path.push(curNode);
                        curNode = curNode.prev;
                    }

                    movePath = path;
                    return path;
                }
                open.add(new GraphNode(i.x, i.y, g, h, curNode));
            }
            open.remove(curNode);
            close.add(curNode);
        }
        return null;
    }

    class MoveSchedule extends TimerTask {
        boolean countdownComplete = false;
        boolean isCountingDown = false;

        public void run() {
            GraphNode nextNode = null;
            GraphNode moveNode = null;
            Game game = Game.getInstance();
            try {
                moveNode = movePath.pop();
            } catch (Exception e) {
                try {
                    Thread.sleep(4000);
                } catch (InterruptedException e1) {
                    // TODO Auto-generated catch block
                    e1.printStackTrace();
                }

                CalculateRandomPath();

                if (movePath == null || movePath.size() == 0) {
                    System.out.println("movePath null");
                    game.SetCellState(curSrc.x, curSrc.y, null);
                    game.SetCellState(curDest.x, curDest.y, null);
                    game.SetAtAgvIdState(GetIdNum(), false);
                    game.RemoveAtAgv(id);
                    App.SendText(String.format("atagv %s el", id));

                    this.cancel();
                } else {
                    App.SendText(String.format("atagv %s dest %d %d", id, finalDest.x, finalDest.y));
                }
                return;
            }

            try {
                nextNode = movePath.peek();

            } catch (Exception e) {
                nextNode = new GraphNode(finalDest);
            }

            game.SetCellState(curSrc.x, curSrc.y, null);
            curSrc = moveNode.pos;
            game.SetCellState(curSrc.x, curSrc.y, id);
            curDest = nextNode.pos;
            String curDestState = game.GetCellState(curDest.x, curDest.y);
            // System.out.println(String.format("%s %s %s", curSrc.x, curSrc.y,
            // curDestState));
            String msg = String.format("atagv %s pos %d %d %d %d", id, curSrc.x, curSrc.y, curDest.x, curDest.y);
            System.out.println(msg);
            App.SendText(msg);

            if (curDestState != null && !curDestState.equals("") && !curDestState.equals(id)) {
                movePath.push(moveNode);
                return;
            }
            game.SetCellState(curDest.x, curDest.y, id);

        }

        class CountdownSchedule extends TimerTask {
            public CountdownSchedule() {
                isCountingDown = true;
                countdownComplete = false;
            }

            public void run() {
                countdownComplete = true;
                isCountingDown = false;
                this.cancel();
            }
        }
    }

}
