import { EmbedBuilder } from 'discord.js';

export function hasChannelEmbed(user) {
  const embedError = new EmbedBuilder()
    .setColor('#f97a50')
    .setAuthor({
      name: user.username,
      iconURL: user.avatarURL(),
    })
    .setDescription(`Такой канал уже добавлен!`)
    .addFields(
      {
        name: '!канал добавить <channelId>',
        value: 'Добавить канал',
        inline: true,
      },
      {
        name: '!канал удалить <channelId>',
        value: 'Удалить канал',
        inline: true,
      },
    );
  return embedError;
}

export function setEmbedAuthor(embed, user) {
  embed.setAuthor({
    name: user.username,
    iconURL: user.avatarURL(),
  });
  return embed;
}

export function getTimeFromMins(mins: number) {
  const hours = Math.trunc(mins / 60);
  const minutes = Math.round(mins % 60);
  return hours + 'ч. ' + minutes + 'м.';
}

export function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function abbreviateNumber(value: number) {
  return Intl.NumberFormat('ru-RU', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
