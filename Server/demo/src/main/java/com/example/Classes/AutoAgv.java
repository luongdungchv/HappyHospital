package com.example.Classes;

import com.example.App;
import com.example.Game;
import java.util.List;
import java.util.Stack;
import java.util.TimerTask;
import java.io.IOException;
import java.util.ArrayList;

public class AutoAgv extends AIEntity {
    public Stack<GraphNode> movePath;

    public AutoAgv(int x, int y) {
        this.curSrc = new Pos(x, y);
        List<Pos> pathPos = Game.getInstance().pathPos;
        int randomIndex = (int) Math.floor(Math.random() * pathPos.size());
        while (!Utils.ValidDest(this.curSrc, pathPos.get(randomIndex))) {
            randomIndex = (int) Math.floor(Math.random() * pathPos.size());
        }
        this.curDest = pathPos.get(randomIndex);
    }

    public AutoAgv(int x, int y, int x1, int y1, int id) {
        this.curSrc = new Pos(x, y);
        this.movePath = CalculatePath(curSrc, new Pos(x1, y1));
        this.curDest = movePath.peek().pos;
        this.id = id;
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
            for (Pos i : game.adjacentList[curNode.pos.x][curNode.pos.y]) {

                boolean canContinue = false;
                for (GraphNode node : close) {
                    if (node.pos.x == i.x && node.pos.y == i.y)
                        canContinue = true;
                }
                if (canContinue)
                    continue;
                int g = curNode.g + 1;
                int h = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
                if (h == 0) {
                    Stack<GraphNode> path = new Stack<GraphNode>();
                    // path.push(curNode);
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
        public void run() {
            GraphNode moveNode = movePath.pop();
            GraphNode nextNode = movePath.peek();
            curSrc = moveNode.pos;
            curDest = nextNode.pos;
            String msg = String.format("atagv pos %d %d %d %d", curSrc.x, curSrc.y, curDest.x, curDest.y);
            try {
                App.SendText(msg);
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
    }

}
