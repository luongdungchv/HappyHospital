package com.example;

import java.util.List;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.Timer;
import java.util.TimerTask;
import com.example.Classes.*;
import com.example.Classes.Models.AIModel;
import com.example.Classes.Models.AdjacentListModel;
import com.example.Classes.Models.AgvModel;
import com.example.Classes.Models.PosModel;
import com.example.Classes.Models.PosPropsModel;
import com.example.Classes.Models.SaveModel;

import javax.websocket.Session;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.*;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.*;

public class Game {
    private static Game instance;
    public static int maxAtagv = 5;

    private String[][] cellStates = new String[52][28];
    private boolean[][] map = new boolean[52][28];

    private Hashtable<String, AutoAgv> atAgvs = new Hashtable<String, AutoAgv>();
    private Hashtable<String, Agent> agents = new Hashtable<String, Agent>();

    private Hashtable<Integer, Boolean> atagvIds = new Hashtable<Integer, Boolean>();
    private Hashtable<Integer, Boolean> agentIds = new Hashtable<Integer, Boolean>();

    public Agv agv;

    public int maxAgents = 5;
    public double spawnProb = 0.3;

    public Pos[] groundPos;
    public Pos[] pathPos;
    public Pos[] doorPos;
    public String[][] pathPosProps;

    public Pos[][][] adjacentList;
    public Session socketSession;

    public Game() {

    }

    protected void finalize() throws Throwable {
        // super.finalize();
        // TODO Auto-generated method stub
        // super.finalize();
        System.out.println("finalize");

    }

    public static Game getInstance() {

        return instance;
    }

    public static void End() {
        for (String id : instance.agents.keySet()) {
            instance.agents.get(id).CancelTimer();
        }
        for (String id : instance.atAgvs.keySet()) {
            instance.atAgvs.get(id).CancelTimer();
        }

        instance.cellStates = null;
        instance.atagvIds = null;
        instance.agentIds = null;
        instance.agents = null;
        instance.atAgvs = null;

        instance = null;
    }

    private static void ConfigureInstance(Game instance) throws IOException {
        instance.adjacentList = Utils.DeserializeJsonFile("adjacent-list.json", AdjacentListModel.class).pos;
        // Generate path pos
        instance.pathPos = Utils.DeserializeJsonFile("pathpos.json", PosModel.class).pos;
        instance.groundPos = Utils.DeserializeJsonFile("groundPos.json", PosModel.class).pos;
        instance.doorPos = Utils.DeserializeJsonFile("doorPos.json", PosModel.class).pos;
        instance.pathPosProps = Utils.DeserializeJsonFile("save (1).json", PosPropsModel.class).props;

        for (int i = 0; i < 10; i++) {
            instance.atagvIds.put(i, false);
        }
        for (int i = 0; i < 100; i++) {
            instance.agentIds.put(i, false);
        }
        for (Pos i : instance.groundPos) {
            instance.SetMap(i.x, i.y, true);
        }
    }

    public static Game createInstance() throws IOException {

        instance = new Game();
        // instance.socketSession = socketSession;

        // Generate adjacent list
        ConfigureInstance(instance);

        instance.SchduleAtagvSpawn();
        instance.ScheduleAgentSpawn();
        // instance.SetCellState(4, 16, "atagv1");
        instance.agv = new Agv(1, 13);
        System.out.println("asasdf");
        return instance;

    }

    public static Game createInstance(SaveModel saveData) throws IOException {

        instance = new Game();
        // instance.socketSession = socketSession;
        AgvModel agvData = saveData.agv;
        AIModel[] agentsData = saveData.agents;
        AIModel[] atagvsData = saveData.autoAgvs;
        // Generate adjacent list
        ConfigureInstance(instance);

        for (AIModel data : agentsData) {
            Agent agent = new Agent(data.x, data.y, data.destX, data.destY, data.id);
        }
        for (AIModel data : atagvsData) {
            AutoAgv agent = new AutoAgv(data.x, data.y, data.destX, data.destY, data.id);
        }

        instance.SchduleAtagvSpawn();
        instance.ScheduleAgentSpawn();
        // instance.SetCellState(4, 16, "atagv1");
        instance.agv = new Agv(agvData.srcX, agvData.srcY, agvData.destX, agvData.destY);
        System.out.println("asasdf");
        return instance;

    }

    public String GetCellState(int x, int y) {
        return cellStates[x][y];
    }

    public String GetCellState(Pos pos) {
        return cellStates[pos.x][pos.y];
    }

    public void SetCellState(int x, int y, String state) {
        cellStates[x][y] = state;
    }

    public void SetCellState(Pos pos, String state) {
        cellStates[pos.x][pos.y] = state;
    }

    public void AddAtAgv(String iden, AutoAgv entity) {
        atAgvs.put(iden, entity);
    }

    public void RemoveAtAgv(String iden) {
        atAgvs.remove(iden);
    }

    public void AddAgent(String iden, Agent a) {
        agents.put(iden, a);

    }

    public Agent GetAgent(String iden) {
        return agents.get(iden);
    }

    public void RemoveAgent(String iden) {
        agents.remove(iden);
    }

    public void SetAtAgvIdState(int id, boolean state) {
        atagvIds.put(id, state);
    }

    public boolean GetAtAgvIdState(int id) {
        System.out.println(id);
        return atagvIds.get(id);
    }

    public void SetAgentIdState(int id, boolean state) {
        agentIds.put(id, state);
    }

    public boolean GetAgentIdState(int id) {
        return agentIds.get(id);
    }

    public void SetMap(int x, int y, boolean state) {
        map[x][y] = state;
    }

    public boolean GetMap(int x, int y) {
        return map[x][y];
    }

    public String GetPathPosProp(int x, int y) {
        String res = "";
        try {
            res = pathPosProps[x][y];
        } catch (Exception e) {
            res = null;
        }
        return res;
    }

    public String GetPathPosProp(Pos pos) {
        return GetPathPosProp(pos.x, pos.y);
    }

    public void SchduleAtagvSpawn() {
        System.out.println("spawn start");
        Timer timer = new Timer();
        TimerTask spawnAtagv = new AutoAgvSpawnSchedule();
        timer.schedule(spawnAtagv, 0, 5000);
        // SetCellState(4, 20, "aagv");
        // AutoAgv newAtagv = new AutoAgv(9, 2, 20, 2, "atagv1");

        // Agent newAtagv = new Agent(9, 2, 20, 2, "agent2");
        // AutoAgv newAtagv = new AutoAgv(1, 14);
    }

    public void ScheduleAgentSpawn() {
        // Agent newAgent = new Agent(20, 2, 9, 2, "agent1");
        Timer timer = new Timer();
        TimerTask spawanAgent = new AgentSpawnSchedule();
        timer.schedule(spawanAgent, 0, 5000);
    }

    class AgentSpawnSchedule extends TimerTask {
        public void run() {
            // int randomId = (int) Math.floor(Math.random() * 100);
            // int randomPosIndex = (int) Math.floor(Math.random() * doorPos.size());
            // Pos randomPos = doorPos.get(randomPosIndex);
            // Agent newAgent = new Agent(randomPos.x, randomPos.y);
            // AddEntity("agent " + String.valueOf(randomId), newAgent);

            if (agents.size() >= 10) {
                return;
            }
            int randomIndex = (int) Math.floor(Math.random() * doorPos.length);
            Pos chosenStart = doorPos[randomIndex];
            Agent newAgent = new Agent(chosenStart.x, chosenStart.y);
        }
    }

    class AutoAgvSpawnSchedule extends TimerTask {
        public void run() {
            if (atAgvs.size() >= 5) {
                this.cancel();
                return;
            }
            AutoAgv newAtagv = new AutoAgv(1, 14);
        }
    }
}
