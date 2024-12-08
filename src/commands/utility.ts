import { 
  ChatInputCommandInteraction, 
  SlashCommandBuilder, 
  EmbedBuilder 
} from 'discord.js';

export const pingCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency'),
  
  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({ 
      content: 'Pinging...', 
      fetchReply: true 
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    
    const embed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Bot Latency', value: `${latency}ms`, inline: true },
        { name: 'API Latency', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed], content: null });
  }
};

export const uptimeCommand = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Check how long the bot has been online'),
  
  async execute(interaction: ChatInputCommandInteraction) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / (24 * 60 * 60));
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    const seconds = Math.floor(uptime % 60);

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('⏰ Bot Uptime')
      .setDescription(`
        **Uptime Breakdown:**
        • Days: ${days}
        • Hours: ${hours}
        • Minutes: ${minutes}
        • Seconds: ${seconds}
      `)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
