package com.example;

import org.glassfish.tyrus.server.*;
import java.io.BufferedReader;
import java.io.IOException;

import com.example.Classes.*;
import com.example.Classes.Models.*;

import java.io.InputStreamReader;

public class Main {
    public static void main(String arg[]) throws IOException {

        runServer();

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
