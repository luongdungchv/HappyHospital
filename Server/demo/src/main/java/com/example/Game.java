package com.example;

import java.util.List;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.Timer;
import java.util.TimerTask;
import com.example.Classes.*;
import javax.websocket.Session;

public class Game {
    private static Game instance;

    private String[][] map = new String[52][28];
    private Hashtable<String, Entity> entities = new Hashtable<String, Entity>();

    public int maxAgents = 5;
    public double spawnProb = 0.3;
    public List<Pos> groundPos = new ArrayList<Pos>();
    public List<Pos> pathPos = new ArrayList<Pos>();
    public List<Pos> doorPos = new ArrayList<Pos>();
    public Pos[][][] adjacentList;
    public Session socketSession;

    public static Game getInstance() {
        if (instance == null) {
            instance = new Game();
        }

        return instance;
    }

    public static void createInstance(Session socketSession) {
        instance = new Game();
        instance.socketSession = socketSession;
    }

    public String GetCellState(int x, int y) {
        return map[x][y];
    }

    public void SetCellState(int x, int y, String state) {
        map[x][y] = state;
    }

    public void AddEntity(String iden, Entity entity) {
        entities.put(iden, entity);
    }

    public void RemoveEntity(String iden) {
        entities.remove(iden);
    }

    class AgentSpawnSchedule extends TimerTask {
        public void run() {
            int randomId = (int) Math.floor(Math.random() * 100);
            int randomPosIndex = (int) Math.floor(Math.random() * doorPos.size());
            Pos randomPos = doorPos.get(randomPosIndex);
            Agent newAgent = new Agent(randomPos.x, randomPos.y, randomId);
            AddEntity("agent " + String.valueOf(randomId), newAgent);
        }
    }

    class AutoAgvSpawnSchedule extends TimerTask {
        public void run() {
            int randomId = (int) Math.floor(Math.random() * 100);
            int randomPosIndex = (int) Math.floor(Math.random() * doorPos.size());
            Pos randomPos = doorPos.get(randomPosIndex);
            AutoAgv newAgent = new AutoAgv(randomPos.x, randomPos.y);
            AddEntity("agent " + String.valueOf(randomId), newAgent);
        }
    }
}
