package com.example.Classes;

import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;
import com.example.*;

public class Agv extends Entity {
    public PosFloat velocity;
    public PosFloat curPos;
    public PosFloat pendingChangeDir;
    Game game;
    Pos finalDest;

    public Agv(int x, int y) {
        this.curSrc = new Pos(x, y);
        this.curDest = curSrc;
        this.curPos = new PosFloat(this.curSrc);
        this.velocity = new PosFloat(0, 0);
        this.game = Game.getInstance();

        String msg = String.format("agv %f %f", curPos.x, curPos.y);
        System.out.println("msg");

        // ChangeDest();
        finalDest = new Pos(4, 2);
        String spawnMsg = String.format("spawn agv %d %d %d %d", curSrc.x, curSrc.y, finalDest.x, finalDest.y);

        App.SendText(spawnMsg);

        TimerTask moveTask = new MoveSchedule();
        Timer timer = new Timer();
        timer.schedule(moveTask, 0, 50);
    }

    private void ChangeDest() {
        int randomDestIndex = (int) (Math.random() * game.pathPos.length);
        int loopCount = 0;
        while (!Utils.ValidDest(curSrc, game.pathPos[randomDestIndex])) {
            randomDestIndex = (int) Math.random() * game.pathPos.length;
            loopCount++;
        }

        finalDest = game.pathPos[randomDestIndex];
        System.out.println(String.format("%d %d %d %d", finalDest.x, finalDest.y, loopCount, randomDestIndex));
    }

    class MoveSchedule extends TimerTask {
        public void run() {
            Game game = Game.getInstance();

            curPos.ResolveApproximation();

            if (game.GetCellState(curSrc) == "agv")
                game.SetCellState(curSrc, null);
            if (game.GetCellState(curDest) == "agv")
                game.SetCellState(curDest, null);

            curSrc = curPos.Floor();
            curDest = curPos.Ceil();

            String state1 = game.GetCellState(curSrc.x, curSrc.y);
            String state2 = game.GetCellState(curDest.x, curDest.y);

            // pendingChangeDir = new PosFloat(0, 0);

            if ((state1 != null && !state1.equals("")) || (state2 != null && !state2.equals(""))) {
                return;
            }

            game.SetCellState(curSrc, "agv");
            game.SetCellState(curDest, "agv");

            if (velocity.x == 0 && velocity.y == 0) {
                pendingChangeDir = new PosFloat(0, 0);
                return;
            }

            System.out.println(
                    String.format("%d %d %d %d %s %f ", curSrc.x, curSrc.y, curDest.x, curDest.y,
                            curPos.x,
                            curPos.y));

            String curSrcProp = game.GetPathPosProp(curSrc);
            String curDestProp = game.GetPathPosProp(curDest);

            // if (curDestProp == null)
            // curDestProp = curSrcProp;
            // if (curSrcProp == null)
            // curSrcProp = curDestProp;

            PosFloat moveDir = new PosFloat(0, 0);

            if (curSrc.Equals(finalDest) && curDest.Equals(finalDest)) {
                ChangeDest();
                App.SendText(String.format("agv dest %d %d", finalDest.x, finalDest.y));
            }

            if (curSrcProp.equals("") && curDestProp.equals("")) {

                PosFloat test = new PosFloat(0, velocity.y).ToOne();

                if (!pendingChangeDir.IsZero()) {
                    curPos = PosFloat.Add(curPos, pendingChangeDir);
                } else {

                    Pos incomingPosH = PosFloat.Add(curPos, new PosFloat(velocity.x, 0).ToOne()).ToPosInt();
                    Pos incomingPosV = PosFloat.Add(curPos, new PosFloat(0, velocity.y).ToOne()).ToPosInt();

                    if (!velocity.IsDiagonal()) {
                        if (game.GetPathPosProp(incomingPosH) != null && velocity.x != 0) {
                            pendingChangeDir = new PosFloat(velocity.x, 0);
                        } else if (game.GetPathPosProp(incomingPosV) != null && velocity.y != 0) {
                            pendingChangeDir = new PosFloat(0, velocity.y);
                            System.out.println("V not null");
                        }
                        System.out.println(
                                String.format("incoming %s %s %s %s %s %s", incomingPosH.x, incomingPosH.y,
                                        incomingPosV.x,
                                        incomingPosV.y, pendingChangeDir.x, game.GetPathPosProp(incomingPosH) != null));

                    }

                    curPos = PosFloat.Add(curPos, pendingChangeDir);
                }

            }

            if ((curSrcProp.equals("left") || curDestProp.equals("left")) && velocity.x < 0) {
                moveDir = new PosFloat(velocity.x, 0);
                pendingChangeDir = new PosFloat(0, velocity.y);
            }
            if ((curSrcProp.equals("right") || curDestProp.equals("right")) && velocity.x > 0) {
                moveDir = new PosFloat(velocity.x, 0);
                pendingChangeDir = new PosFloat(0, velocity.y);
            }
            if ((curSrcProp.equals("top") || curDestProp.equals("top")) && velocity.y < 0) {
                moveDir = new PosFloat(0, velocity.y);
                pendingChangeDir = new PosFloat(velocity.x, 0);
            }
            if ((curSrcProp.equals("bottom") || curDestProp.equals("bottom")) && velocity.y > 0) {
                moveDir = new PosFloat(0, velocity.y);
                pendingChangeDir = new PosFloat(velocity.x, 0);
            }

            System.out.println(
                    String.format("pending %s %s", pendingChangeDir.x, pendingChangeDir.y));

            curPos = PosFloat.Add(curPos, moveDir);
            String msg = String.format("agv %f %f %f %f %s %s", curPos.x, curPos.y, velocity.x, velocity.y, curSrcProp,
                    curDestProp);
            System.out.println(msg);
            App.SendText(String.format("agv %f %f", curPos.x, curPos.y));

        }
    }
}
