package com.example.Classes;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import com.example.Classes.Models.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Utils {
    public static boolean ValidDest(Pos src, Pos dest) {
        if ((dest.y == 14 || dest.y == 13) &&
                ((dest.x >= 0 && dest.x <= 5) || (dest.x >= 45 && dest.x <= 50))) {
            return false;
        }
        double d = Math.abs(dest.x - src.x) + Math.abs(dest.y - src.y);
        if (d < 5)
            return false;
        return true;
    }

    public static <T extends Model> T DeserializeJson(String jsonFilename, Class<T> type)
            throws JsonMappingException, JsonProcessingException {
        final Class<T> classType = type;

        String json = "";
        try {
            json = new String(Files.readAllBytes(Paths.get(
                    Constants.BASE_PATH + jsonFilename)));
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        ObjectMapper mapper = new ObjectMapper();
        T model = mapper.readValue(json, classType);
        return model;
    }
}
