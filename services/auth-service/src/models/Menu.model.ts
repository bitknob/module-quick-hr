import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface MenuAttributes {
  id: string;
  label: string;
  path: string;
  icon?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuCreationAttributes
  extends Optional<MenuAttributes, 'displayOrder' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class Menu
  extends Model<MenuAttributes, MenuCreationAttributes>
  implements MenuAttributes
{
  public id!: string;
  public label!: string;
  public path!: string;
  public icon?: string;
  public parentId?: string;
  public displayOrder!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public parentMenu?: Menu;
  public childMenus?: Menu[];
  public menuRoles?: any[];
}

Menu.init(
  {
    id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
    },
    label: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    parentId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      references: {
        model: 'Menus',
        key: 'id',
      },
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'Menus',
    indexes: [
      { fields: ['parentId'] },
      { fields: ['displayOrder'] },
      { fields: ['isActive'] },
    ],
  }
);

Menu.belongsTo(Menu, {
  foreignKey: 'parentId',
  as: 'parentMenu',
});

Menu.hasMany(Menu, {
  foreignKey: 'parentId',
  as: 'childMenus',
});

