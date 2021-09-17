import get from "got";
import { readFile, writeFile } from "fs/promises"

const apiUrl = "https://playerdb.co/api/player/minecraft";

//Start in an async context
(async () => {
    const contents = await readFile("usernames", "utf-8").catch(console.error);
    if (!contents) {
        console.log("Failed to get data for the given usernames");
        return;
    }

    //Split the file contents to a iterable array list
    const names = contents.split('\n').filter((line) => line.length > 0);

    //For tracking progress
    let processed = 0;
    let succeeded = 0;

    //Async iterate through the array and populate the data
    const data: { uuid: string, name: string, }[] = [];
    await Promise.all(names.map(async (name) => {
        return get(`${apiUrl}/${name}`)
            .then((res) => JSON.parse(res.body))
            .then((body) => {
                processed++;
                console.log(`Processed: ${Math.round((processed / names.length) * 100)}%`)

                if (body.code != "player.found") {
                    console.log(`Could not find uuid for player ${name}!`);
                    return;
                }
                data.push({ uuid: body.data.player.id as string, name: name });
                succeeded++;
            }).catch(console.error);
    }))


    writeFile("whitelist.json", JSON.stringify(data, null, 2), "utf-8");
    console.log(`Wrote to whitelist.json, Succeeded on ${succeeded} / ${names.length}`);
})()