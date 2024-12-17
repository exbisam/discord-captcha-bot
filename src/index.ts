import './validate-env';
import 'dotenv/config';
import './server';

import { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  EmbedBuilder, 
  Collection, 
  Routes 
} from 'discord.js';
import { REST } from '@discordjs/rest';
import { pingCommand, uptimeCommand } from './commands/utility';
import { verificationTracker } from './verification-tracker';

const client = new Client({
  allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
  ],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Add commands collection
(client as any).commands = new Collection();
(client as any).commands.set(pingCommand.data.name, pingCommand);
(client as any).commands.set(uptimeCommand.data.name, uptimeCommand);

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = (client as any).commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ 
      content: 'There was an error executing this command!', 
      ephemeral: true 
    });
  }
});

client.login(process.env.TOKEN);

client.on('ready', async () => {
  console.log('Login in as ' + client.user?.tag);

  // Register slash commands
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(client.application!.id),
      { 
        body: [
          pingCommand.data.toJSON(), 
          uptimeCommand.data.toJSON()
        ] 
      },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

client.on('guildMemberAdd', async member => {
  // Track new member for verification
  verificationTracker.trackNewMember(member);

  const embed = new EmbedBuilder()
    .setTitle('Verification')
    .setDescription(
      `Please solve captcha here: ${process.env.CALLBACK_URL}\nBefore accessing to the server!\nYou have 10 minutes to verify.`,
    );

  await member.send({ embeds: [embed] });
});

export default client;
