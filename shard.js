const {ShardingManager} = require("discord.js");
const {token, numberOfShards} = require("./config.json");

const manager = new ShardingManager("./index.js", {
    token,
    totalShards: numberOfShards 
});

manager.spawn();
manager.on("shardCreate", shard => console.log(`Shard ${shard.id} is online`));