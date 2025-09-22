import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  login: string;

  @Column()
  pswd: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  codigo_empresa: number;
}