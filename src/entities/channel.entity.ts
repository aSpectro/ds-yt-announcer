import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  channelId: string;
}
