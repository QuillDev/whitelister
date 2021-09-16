import get from "got";
import { readFile, writeFile } from "fs/promises"

const apiUrl = "https://playerdb.co/api/player/minecraft";

(async () => {
    const contents = await readFile("usernames", "utf-8").catch(console.error);
    if (!contents) {
        console.log("Failed to get data for the given usernames");
        return;
    }

    const names = contents.split('\n').filter((line) => line.length > 0);
    const data: { username: string, uuid: string }[] = [];

    await Promise.all(names.map(async (name) => {
        return get(`${apiUrl}/${name}`).then((res) => JSON.parse(res.body)).then((body) => {
            if (body.code != "player.found") {
                console.log(`Could not find uuid for player ${name}!`);
                return;
            }
            data.push({ username: name, uuid: body.data.player.id as string });
        });
    }))

    writeFile("whitelist.json", JSON.stringify(data), "utf-8");
})()