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

    private TimerTask task;
    private Timer timer;

    @OnOpen
    public void onOpen(Session session) {
        System.out.println(String.format("WebSocket opened: %s", session.getId()));

        timer = new Timer();
        task = new MessageSchedule(session);
        timer.schedule(task, 0, 2000);
    }

    @OnMessage
    public void onMessage(String txt, Session session) throws IOException {
        System.out.println(String.format("Message received: %s", txt));
        String s = txt.substring(2, txt.length());

        if (txt.contains("ma")) {
            int newMaxAgent = Integer.parseInt(s);
            MessageSchedule.maxAgent = newMaxAgent;
        }
        if (txt.contains("pr")) {
            float newSpawnProb = Float.parseFloat(s);
            System.out.println(newSpawnProb);
            MessageSchedule.spawnProb = newSpawnProb;
        }
        if (txt.contains("rm")) {
            MessageSchedule.i--;
            System.out.println(MessageSchedule.i);
        }
        if (txt.contains("aa")) {
            int newAgentAmount = Integer.parseInt(s);
            MessageSchedule.i = newAgentAmount;
            System.out.println(MessageSchedule.i);
        }
        // session.getBasicRemote().sendText(txt.toUpperCase());
    }

    @OnClose
    public void onClose(CloseReason reason, Session session) {
        System.out.println(
                String.format("Closing a WebSocket (%s) due to %s", session.getId(), reason.getReasonPhrase()));
        timer.cancel();
    }

    @OnError
    public void onError(Session session, Throwable t) {
        System.out
                .println(String.format("Error in WebSocket session %s%n", session == null ? "null" : session.getId()));
    }
}