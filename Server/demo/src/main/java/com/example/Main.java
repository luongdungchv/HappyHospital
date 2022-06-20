package com.example;

import org.glassfish.tyrus.server.*;
import java.io.BufferedReader;
import java.io.IOException;

import com.example.Classes.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.*;

import java.io.InputStreamReader;
import java.nio.file.*;
import java.util.List;
import java.util.Stack;

public class Main {
    public static void main(String arg[]) throws IOException {

        // Game game = Game.createInstance();
        // Agent a = new Agent(9, 2);
        // System.out.println(game.GetMap(0, 0));
        // System.out.println(game.GetCellState(0, 0));
        // Entity e = new AutoAgv(49, 13, 45, 2, "2");
        // game.AddEntity("1", e);

        // model.PrintList();
        runServer();
        // List<Pos> list = Agent.GetAdjacentCells(51, 27);
        // System.out.println("sdf");
        // System.out.println(Utils.ValidDest(new Pos(0, 0), new Pos(4, 13)));

    }

    static void runServer() {
        Server server = new Server("localhost", 8025, "/websockets", App.class);

        try {

            server.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));

            System.out.print("Please press a key to stop the server.");

            reader.readLine();

        } catch (Exception e) {

            throw new RuntimeException(e);

        } finally {

            server.stop();

        }
    }
}
