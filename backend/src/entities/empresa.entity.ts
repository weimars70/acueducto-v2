import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn({ name: 'codigo' })
  codigo: number;

  @Column({ type: 'text', nullable: false })
  codigo_alterno: string;

  @Column({ type: 'text', nullable: false })
  nombre: string;

  @Column({ type: 'text', nullable: false })
  direccion: string;

  @Column({ type: 'text', nullable: false })
  ident: string;

  @Column({ type: 'text', nullable: false })
  telefono: string;
}