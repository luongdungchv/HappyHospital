package com.example.Classes;

import com.example.App;
import com.example.Game;
import java.util.List;
import java.util.Queue;
import java.util.Stack;
import java.util.Timer;
import java.util.TimerTask;
import java.io.IOException;
import java.util.ArrayList;

public class Agent extends AIEntity {

    public Stack<GraphNode> movePath;
    public Pos finalDest;
    public boolean isPrior = false;
    public int pathLength;

    public Agent() {

    }

    @Override
    protected void finalize() throws Throwable {
        // TODO Auto-generated method stub
        // super.finalize();
        System.out.println("finalize");

    }

    public Agent(int x, int y) {
        Game game = Game.getInstance();
        this.curSrc = new Pos(x, y);
        int randId = (int) Math.floor(Math.random() * 100);

        while (game.GetAgentIdState(randId)) {
            randId = (int) Math.floor(Math.random() * 100);
        }
        game.SetAgentIdState(randId, true);
        this.id = String.format("agent%d", randId);
        game.AddAgent(this.id, this);
        System.out.println("new agent: " + game.GetAgent(this.id));

        CalculateRandomPath();
        App.SendText(String.format("spawn agent %s %d %d %d %d", this.id, x, y, finalDest.x, finalDest.y));

        timer = new Timer();
        TimerTask task = new MoveSchedule();
        timer.schedule(task, 0, 4000);
    }

    public Agent(int x, int y, int x1, int y1, String newId) {
        Game game = Game.getInstance();
        this.curSrc = new Pos(x, y);
        this.id = newId;
        this.movePath = CalculatePath(new Pos(x, y), new Pos(x1, y1), new Pos[0]);
        this.finalDest = new Pos(x1, y1);
        System.out.println("haha");
        game.AddAgent(this.id, this);
        App.SendText(String.format("spawn agent %s %d %d %d %d", this.id, x, y, finalDest.x, finalDest.y));

        timer = new Timer();
        TimerTask task = new MoveSchedule();
        timer.schedule(task, 0, 4000);
    }

    private void CalculateRandomPath() {
        Pos[] doorPos = Game.getInstance().doorPos;
        int randDestIndex = (int) Math.floor(Math.random() * doorPos.length);
        this.finalDest = doorPos[randDestIndex];
        this.movePath = CalculatePath(this.curSrc, finalDest, new Pos[0]);
    }

    public Stack<GraphNode> CalculatePath(Pos start, Pos end, Pos[] excludedPos) {
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
            Pos[] listPos = GetAdjacentCells(curNode.pos.x, curNode.pos.y);
            for (Pos i : listPos) {

                if (!game.GetMap(i.x, i.y)) {
                    continue;
                }
                boolean canContinue = false;
                for (Pos excluded : excludedPos) {
                    if (excluded.x == i.x && excluded.y == i.y)
                        canContinue = true;
                }
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
                    pathLength = movePath.size();
                    return path;
                }
                open.add(new GraphNode(i.x, i.y, g, h, curNode));
            }
            open.remove(curNode);
            close.add(curNode);
        }
        return null;
    }

    private Pos[] GetAdjacentCells(int x, int y) {

        List<Pos> result = new ArrayList<Pos>();
        // Pos[] res;
        if (x + 1 <= 52) {
            result.add(new Pos(x + 1, y));
            if (y + 1 <= 28)
                result.add(new Pos(x + 1, y + 1));
            if (y - 1 >= 0)
                result.add(new Pos(x + 1, y - 1));
        }
        if (x - 1 >= 0) {
            result.add(new Pos(x - 1, y));
            if (y + 1 <= 28)
                result.add(new Pos(x - 1, y + 1));
            if (y - 1 >= 0)
                result.add(new Pos(x - 1, y - 1));
        }
        if (y - 1 >= 0)
            result.add(new Pos(x, y - 1));

        if (y + 1 <= 28)
            result.add(new Pos(x, y + 1));
        return result.toArray(new Pos[0]);
    }
    // private Stack<GraphNode> PartitionMovePath(Queue<GraphNode> path){
    // Stack<GraphNode> res = new Stack<GraphNode>();
    // GraphNode toNode = path.poll();
    // GraphNode fromNode = path.peek();
    // Pos dir = new Pos(fromNode.pos.x - toNode.pos.x,fromNode.pos.y -
    // toNode.pos.y);
    // return res;
    // }

    class MoveSchedule extends TimerTask {

        private List<Pos> excludeds = new ArrayList<Pos>();

        public MoveSchedule() {
        }

        public void run() {
            GraphNode nextNode = null;
            GraphNode moveNode = null;
            Game game = Game.getInstance();

            try {
                moveNode = movePath.pop();
            } catch (Exception e) {
                // CalculateRandomPath();

                try {
                    App.SendText(String.format("agent %s el", id));
                    if (curSrc != null)
                        game.SetCellState(curSrc.x, curSrc.y, null);
                    if (curDest != null)
                        game.SetCellState(curDest.x, curDest.y, null);
                    game.SetAgentIdState(GetIdNum(), false);
                    game.RemoveAgent(id);

                } catch (Exception e1) {
                    // TODO Auto-generated catch block
                    e1.printStackTrace();
                }
                this.cancel();
                return;
            }

            try {
                nextNode = movePath.peek();

            } catch (Exception e) {
                nextNode = new GraphNode(finalDest);
            }
            if (movePath.size() < pathLength - 1) {
                excludeds = new ArrayList<Pos>();
            }

            game.SetCellState(curSrc.x, curSrc.y, null);
            curSrc = moveNode.pos;
            game.SetCellState(curSrc.x, curSrc.y, id);
            curDest = nextNode.pos;
            String curDestState = game.GetCellState(curDest.x, curDest.y);
            // System.out.println(String.format("%s %s %s", curSrc.x, curSrc.y,
            // curDestState));
            System.out.println(String.format("agent %s %d %d %s", id, curDest.x, curDest.y, curDestState));

            if (curDestState != null && !curDestState.equals("") && !curDestState.equals(id)) {

                // movePath.push(moveNode);
                if (curDestState.contains("agv")) {
                    isPrior = false;
                    // Pos[] excludeds = GetExcludeds(curDest);
                    excludeds.add(curDest);
                    movePath = CalculatePath(curSrc, finalDest, excludeds.toArray(new Pos[0]));
                    System.out.println(String.format("dest: %d %d", curDest.x, curDest.y));
                    this.run();
                    return;
                } else {
                    boolean isObstaclePrior = game.GetAgent(curDestState).isPrior;
                    if (isPrior) {

                        if (isObstaclePrior) {
                            isPrior = false;
                            // Pos[] excludeds = GetExcludeds(curDest);
                            excludeds.add(curDest);
                            movePath = CalculatePath(curSrc, finalDest, excludeds.toArray(new Pos[0]));
                            this.run();
                            return;
                        }
                    }
                    if (!isPrior) {
                        if (!isObstaclePrior) {
                            game.GetAgent(curDestState).isPrior = true;

                        }
                        // Pos[] excludeds = GetExcludeds(curDest);
                        excludeds.add(curDest);
                        movePath = CalculatePath(curSrc, finalDest, excludeds.toArray(new Pos[0]));
                        this.run();
                        return;

                    }

                }
                movePath.push(moveNode);
                return;

            }
            String msg = String.format("agent %s pos %d %d", id, curDest.x,
                    curDest.y);
            game.SetCellState(curDest.x, curDest.y, id);
            App.SendText(msg);

        }

        public Pos[] GetExcludeds(Pos base) {
            Game game = Game.getInstance();
            String state = "";
            Pos curPos = new Pos();
            List<Pos> res = new ArrayList<Pos>();
            res.add(base);

            curPos = new Pos(base.x, base.y + 1);
            state = game.GetCellState(curPos);
            if (state != null && !state.equals("") && !state.equals(id))
                res.add(curPos);

            curPos = new Pos(base.x, base.y - 1);
            state = game.GetCellState(curPos);
            if (state != null && !state.equals("") && !state.equals(id))
                res.add(curPos);

            curPos = new Pos(base.x + 1, base.y);
            state = game.GetCellState(curPos);
            if (state != null && !state.equals("") && !state.equals(id))
                res.add(curPos);

            curPos = new Pos(base.x - 1, base.y);
            state = game.GetCellState(curPos);
            if (state != null && !state.equals("") && !state.equals(id))
                res.add(curPos);

            return res.toArray(new Pos[0]);

        }
    }

}
