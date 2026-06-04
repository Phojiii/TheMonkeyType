import { Client, GatewayIntentBits } from "discord.js";

let client;

export async function getDiscordClient() {
  if (client) return client;

  client = new Client({
    intents: [],
  });

  await client.login(process.env.DISCORD_BOT_TOKEN);

  return client;
}