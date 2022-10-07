import {
  Client,
  Collection,
  ActivityType,
  GatewayIntentBits,
} from 'discord.js';
import { NestFactory } from '@nestjs/core';
import * as xmlparser from 'express-xml-bodyparser';

import { AppService } from './app.service';
import { AppModule } from './app.module';
import { configService } from './config/config.service';
import config from './commands/config';
import CommandList from './commands';

interface ClientModel extends Client {
  commands: Collection<any, any>;
}
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
}) as ClientModel;

async function App() {
  const app = await NestFactory.create(AppModule);
  app.use(xmlparser());
  await app.listen(configService.getPort());
  const service = app.get<AppService>(AppService);

  client.commands = new Collection();
  for (const command of CommandList) {
    client.commands.set(command.name, command);
  }

  try {
    client.on('ready', () => {
      client.user.setActivity(config.bot.rpc, {
        type: ActivityType.Watching,
      });
      service.setClient(client);
      console.log('bot ready!');
    });

    client.on('messageCreate', async (message) => {
      const prefix = config.bot.prefix;

      if (
        !message.content.startsWith(prefix) ||
        message.author.bot ||
        message.author.system ||
        (configService.isProduction() &&
          message.channel.id !== configService.getChannel())
      )
        return;

      const messageArray = message.content.split(' ');
      const command = messageArray[0];
      const args = messageArray.slice(1);
      const commandController = client.commands.get(
        command.slice(prefix.length).trimStart().toLowerCase(),
      );
      if (commandController) {
        try {
          await commandController.run(message, args, service);
        } catch (err) {
          //
        }
      }
    });

    client.login(config.bot.token);
  } catch (error) {
    console.log(error);
  }
}
App();
