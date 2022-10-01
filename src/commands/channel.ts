import Command from './Command';
import { AppService } from './../app.service';
import { setEmbedAuthor } from './helpers';
import { ChannelDTO } from 'src/dto/channel.dto';

enum ChannelAction {
  add = 'добавить',
  delete = 'удалить',
}

export class ChannelCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
  }

  run(
    message: any,
    args: any,
    service: AppService,
    isSlash: boolean | undefined,
  ) {
    this.initCommand(message, args, service, isSlash, async () => {
      const user = this.getUser();
      const action: any = this.getArgByIndex(0);
      const channel: string = this.getArgByIndex(1);

      if (user.id === this.config.admin) {
        if (!action) {
          this.embed.setDescription(
            'Ты не указал действие! **!канал добавить/удалить <channelId>**',
          );
        } else if (!channel) {
          this.embed.setDescription(
            'Ты не указал channelId! **!канал добавить/удалить <channelId>**',
          );
        } else {
          const res = await service.checkChannel(channel);
          if (res.status === 200 && action === ChannelAction.add) {
            this.replyHasChannel(user);
          } else {
            if (action === ChannelAction.add) {
              const newChannel: ChannelDTO = {
                channelId: channel,
              };
              const res = await this.service.createChannel(newChannel);
              if (res.status === 200) {
                this.embed.setDescription('Канал добавлен!');
              }
            } else {
              const res = await this.service.deleteChannel(channel);
              if (res.status === 200) {
                this.embed.setDescription('Канал удален!');
              }
            }
          }
        }

        this.send({
          embeds: [setEmbedAuthor(this.embed, user)],
        });
      }
    });
  }
}
