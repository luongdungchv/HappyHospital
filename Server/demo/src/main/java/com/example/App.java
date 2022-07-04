package com.example;

import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;
import java.nio.file.*;
import com.example.Classes.*;
import com.example.Classes.Models.Model;
import com.example.Classes.Models.SaveModel;
import com.fasterxml.jackson.databind.*;

class MessageSchedule extends TimerTask {
    public static int i = 0;
    public static int maxAgent = 5;
    public static float spawnProb = 0.3f;
    private Session session;
    private static int run = 0;

    public MessageSchedule(Session session) {
        this.session = session;
        i = 0;
        run = 0;
    }

    public void run() {
        if (run == 0) {
            run = 1;
            return;
        }
        double rand = Math.random();
        if (rand < spawnProb) {
            try {
                if (i < maxAgent) {
                    session.getBasicRemote().sendText("Generate");
                    i++;
                    System.out.println("Number of Agent: " + i);
                }
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

    }
}

@ServerEndpoint("/toUpper")
public class App {

    // private static final Logger LOGGER =
    // Logger.getLogger(ToUpperWebsocket.class);

    private static Session socketSession;

    public static void SendText(String text) {
        try {
            socketSession.getBasicRemote().sendText(text);
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    @OnOpen
    public void onOpen(Session session) throws IOException {
        SaveModel testData = Utils.DeserializeJsonFile("save (8).json", SaveModel.class);
        socketSession = session;
        Game game = Game.createInstance(testData);
        game.socketSession = session;
        System.out.println("Session started");

    }

    @OnMessage
    public void onMessage(String txt, Session session) throws IOException {
        double speed = 0.1000000000000;
        Game game = Game.getInstance();

        try {
            SaveModel saveData = Utils.DeserializeJsonString(txt, SaveModel.class);
            Game.End();
            game = Game.createInstance(saveData);
            game.socketSession = session;

        } catch (Exception e) {

        }

        System.out.println(txt);
        String[] cmdList = txt.split(" ");

        // String typeCmd = cmdList[0];
        // String dirCmd = cmdList[1];

        if (cmdList[0].equals("agv")) {
            if (cmdList[1].equals("right")) {
                if (cmdList[2].equals("d")) {
                    game.agv.velocity = PosFloat.Add(game.agv.velocity, new PosFloat(speed, 0));
                    // System.out.println(String.format("%e %e", game.agv.velocity.x,
                    // game.agv.velocity.y));

                } else if (cmdList[2].equals("u")) {
                    game.agv.velocity = PosFloat.Minus(game.agv.velocity, new PosFloat(speed, 0));
                }
            }

            if (cmdList[1].equals("left")) {
                if (cmdList[2].equals("d")) {
                    game.agv.velocity = PosFloat.Add(game.agv.velocity, new PosFloat(-speed, 0));
                } else if (cmdList[2].equals("u")) {
                    game.agv.velocity = PosFloat.Minus(game.agv.velocity, new PosFloat(-speed, 0));
                }
            }
            if (cmdList[1].equals("top")) {
                if (cmdList[2].equals("d")) {
                    game.agv.velocity = PosFloat.Add(game.agv.velocity, new PosFloat(0, -speed));
                } else if (cmdList[2].equals("u")) {
                    game.agv.velocity = PosFloat.Minus(game.agv.velocity, new PosFloat(0, -speed));
                }
            }
            if (cmdList[1].equals("bottom")) {
                if (cmdList[2].equals("d")) {
                    game.agv.velocity = PosFloat.Add(game.agv.velocity, new PosFloat(0, speed));
                } else if (cmdList[2].equals("u")) {
                    game.agv.velocity = PosFloat.Minus(game.agv.velocity, new PosFloat(0, speed));
                }
            }
            // System.out.println(String.format("%e %e", game.agv.velocity.x,
            // game.agv.velocity.y));
        }

        // int index = txt.indexOf("_");
        // String cmd = txt.substring(0, index);
        // String arg = txt.substring(index);
        // session.getBasicRemote().sendText(txt.toUpperCase());
    }

    @OnClose
    public void onClose(CloseReason reason, Session session) {
        System.out.println(
                String.format("Closing a WebSocket (%s) due to %s", session.getId(), reason.getReasonPhrase()));
        Game.End();
        // timer.cancel();
    }

    @OnError
    public void onError(Session session, Throwable t) throws IOException {
        // System.out
        // .println(String.format("Error in WebSocket session %s%n", session == null ?
        // "null" : session.getId()));
        // System.out.println(t);
        t.printStackTrace();
        session.close();
        Game.End();
    }
}