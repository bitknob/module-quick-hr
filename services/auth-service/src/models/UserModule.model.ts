import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User.model';

export interface UserModuleAttributes {
  id: string;
  userId: string;
  moduleKey: string;
  moduleName: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserModuleCreationAttributes
  extends Optional<UserModuleAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class UserModule
  extends Model<UserModuleAttributes, UserModuleCreationAttributes>
  implements UserModuleAttributes
{
  public id!: string;
  public userId!: string;
  public moduleKey!: string;
  public moduleName!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public user?: User;
}

UserModule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    moduleKey: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    moduleName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
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
    tableName: 'UserModules',
    indexes: [
      { fields: ['userId', 'moduleKey'], unique: true },
      { fields: ['userId'] },
      { fields: ['moduleKey'] },
      { fields: ['isActive'] },
    ],
  }
);

UserModule.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(UserModule, {
  foreignKey: 'userId',
  as: 'modules',
});

