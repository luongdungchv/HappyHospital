package com.example.Classes.Models;

public class SaveModel extends Model {
    public AgvModel agv;
    public AIModel[] agents;
    public AIModel[] autoAgvs;
    public int maxAgents = 5;
    public float spawnProb = 0.3f;
}
