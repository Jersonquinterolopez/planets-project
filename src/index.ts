import { parse } from "csv-parse";
import fs from "fs";

const results: Array<string | Buffer> = [];

// This a real example of the emitter and the event-driven development
// in Node, as we see we are using events that are subscribed to the
// createReadStream function. each event triggers an action

interface Planet {
    koi_disposition: string;
    koi_insol: number;
    koi_prad: number;
    kepler_name: string;
}

const habitablePlanets: Array<Planet> = [];

function isHabitablePlanet(planet: Planet): boolean {
    const planetIsConfirmed = planet["koi_disposition"] === "CONFIRMED";
    const stellarFluxBetween = planet["koi_insol"] > 0.36 && planet["koi_insol"] < 1.11;
    const planetRadiusUnder = planet["koi_prad"] < 1.6;

    const result = planetIsConfirmed && stellarFluxBetween && planetRadiusUnder;
    return result;
}

// createReadStream returns a stream of bytes
fs.createReadStream("kepler_data.csv")
    // with pipe we can pass the stream to another function before that the stream is consumed by the event 'data'
    .pipe(
        // we can pass optios to the parse method
        parse({
            comment: "#", // specify that comment character is #
            columns: true, // returns each raw of the csv file as an object with key value pairs
        })
    )
    // the data callback iterate for each item
    .on("data", (data) => {
        if (isHabitablePlanet(data)) {
            habitablePlanets.push(data);
        }
    })
    .on("error", (error) => {
        console.log("❌ Error:", error);
    })
    .on("end", () => {
        console.log(`🌍 ${habitablePlanets.length} habitable planets found!`);
        console.log(habitablePlanets.map((planet) => planet["kepler_name"]));
    });
