import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Sequelize,
} from 'sequelize-typescript';

/**
 * @openapi
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - date
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "a3fa8c0b-5f01-4c57-9e4d-82bdbf8f82fa"
 *         title:
 *           type: string
 *           example: "Название мероприятия"
 *         description:
 *           type: string
 *           example: "Описание мероприятия"
 *         date:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: string
 *           format: uuid
 *           example: "a3fa8c0b-5f01-4c57-9e4d-82bdbf8f82fa"
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 */

@Table({
  tableName: 'Events',
  paranoid: true,
  timestamps: true,
})
export class Event extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare title: string;

  @Column(DataType.TEXT)
  declare description: string | null;

  @Column(DataType.DATE)
  declare date: Date;

  @Column(DataType.UUID)
  declare createdBy: string;

  @Column({
    type: DataType.ARRAY(DataType.UUID),
    defaultValue: Sequelize.literal("ARRAY[]::uuid[]"),
    field: 'participants',
    get() {
      const rawValue = this.getDataValue('participants');
      return rawValue || [];
    },
    set(value: string[]) {
      this.setDataValue('participants', value || []);
    }
  })
  declare participants: string[];

  @CreatedAt
  @Column({ 
    type: DataType.DATE,
    field: 'created_at' 
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ 
    type: DataType.DATE,
    field: 'updated_at' 
  })
  declare updatedAt: Date;

  @DeletedAt
  @Column({ 
    type: DataType.DATE,
    field: 'deleted_at' 
  })
  declare deletedAt: Date | null;
}
