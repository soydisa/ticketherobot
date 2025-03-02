const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`The file ${filePath} cannot be loaded into the Client`);
		}
	}
}

const rest = new REST().setToken(process.env.Token);

(async () => {
	try {
		const data = await rest.put(
            Routes.applicationCommands(process.env.ClientID),
            { body: commands },        
		);

		console.log(`Registered ${data.length} / ${commands.length} commands`);
	} catch (error) {
		console.error(error);
	}
})();