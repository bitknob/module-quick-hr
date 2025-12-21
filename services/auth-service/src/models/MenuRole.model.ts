import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface MenuRoleAttributes {
  id: string;
  menuId: string;
  roleKey: string;
  createdAt?: Date;
}

export interface MenuRoleCreationAttributes
  extends Optional<MenuRoleAttributes, 'id' | 'createdAt'> {}

export class MenuRole
  extends Model<MenuRoleAttributes, MenuRoleCreationAttributes>
  implements MenuRoleAttributes
{
  public id!: string;
  public menuId!: string;
  public roleKey!: string;
  public readonly createdAt!: Date;
}

MenuRole.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    menuId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: 'Menus',
        key: 'id',
      },
    },
    roleKey: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'MenuRoles',
    timestamps: true,
    updatedAt: false,
    createdAt: 'createdAt',
    indexes: [
      { fields: ['menuId', 'roleKey'], unique: true },
      { fields: ['menuId'] },
      { fields: ['roleKey'] },
    ],
  }
);


