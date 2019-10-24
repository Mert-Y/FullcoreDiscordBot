const Discord = require("discord.js");
const fs = require('fs');
const client = new Discord.Client();
const configFileName = "config.json";
var configFile;
var sentMessages = false;
var notifyMin = 10;

var config = {
    token: '',
    forzathonUsers: []
};

init();
function init() {
    loadConfigFile();
}

client.login(config.token).catch(function () {
    console.log("Promise Rejected");
});

client.on("ready", () => {
    var today = new Date();
    console.log("I am ready!");

    setInterval(() => {
        main();
    }, 10000); // Runs this every 10 seconds.
});

client.on("message", (message) => {
    if (message.content.toUpperCase() === "!forzathonreg".toUpperCase()) {
        var author = message.author;
        message.delete()
        .then(msg => console.log('Deleted message from ' + msg.author.username))
        .catch(console.error);

        if (!isUnique(config.forzathonUsers, author.id)) {
            message.author.send("Successfully registered to the Forzathon timer.");
            console.log("Registered user: " + author.username);
            if (config.forzathonUsers) {
                config.forzathonUsers.push(author.id);
            } else {
                config.forzathonUsers = new Array(author.id);
            }
            fs.writeFileSync(configFileName, JSON.stringify(config));
        } else {
            message.author.send("You are already registered to the Forzathon timer.");
        }
    }
    if (message.content.toUpperCase() === "!forzathondereg".toUpperCase()) {
        var author = message.author;
        message.delete()
        .then(msg => console.log('Deleted message from ' + msg.author.username))
        .catch(console.error);

        if (isUnique(config.forzathonUsers, author.id)) {
            message.author.send("Successfully deregistered from the Forzathon timer.");
            console.log("Deregistered user: " + author.username);
            if (config.forzathonUsers) {
                config.forzathonUsers = arrayRemove(config.forzathonUsers, author.id);
                fs.writeFileSync(configFileName, JSON.stringify(config));
            }
        } else {
            message.author.send("You need to register first in order to deregister from the Forzathon timer, pepega.");
        }
    }
    if (message.content.toUpperCase() === "!fcbothelp".toUpperCase()) {
        var author = message.author;
        message.delete()
        .then(msg => console.log('Deleted message from ' + msg.author.username))
        .catch(console.error);
        message.author.send("!forzathonreg, Registers you to the Forzathon timer which notifies when there are " + notifyMin + " minutes left to the event.\n!forzathondereg, Deregisters you from the Forzathon timer.");
    }
});

function isUnique(array, value) {
    for (var v of array) {
        if (value == v) {
            return true;
        }
    }
    return false;
}

function arrayRemove(array, value) {
    return array.filter(function (ele) {
        return ele != value;
    });
}

function loadConfigFile() {
    config = JSON.parse(readFile(configFileName));
}

function readFile(file) {
    // Read file, create if it doesn't exist.
    var returnData = "error";
    try {
        returnData = fs.readFileSync(file, 'utf8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('File not found!');
            try {
                fs.writeFileSync(file, '', 'utf8');
                returnData = loadFile(file);
            } catch (err) {
                throw err;
            }
        } else {
            throw err;
        }
    }
    return returnData;
}

function main() {
    var today = new Date();
    if (today.getHours() > 8 || today.getHours() < 2) {
        if (60 - today.getMinutes() <= notifyMin && !sentMessages) {
            for (var id of config.forzathonUsers) {
                console.log(today.getHours() + ":" + today.getMinutes() + " Sent message to: " + client.users.get(id).username);
                var message = 60 - today.getMinutes() + " mins for Forzathon.";
                if (today.getMinutes() == 1) {
                    message = 60 - today.getMinutes() + " min for Forzathon.";
                }
                client.users.get(id).send(message);
            }
            sentMessages = true;
        } else if (60 - today.getMinutes() > notifyMin) {
            sentMessages = false;
        }
    }
}
