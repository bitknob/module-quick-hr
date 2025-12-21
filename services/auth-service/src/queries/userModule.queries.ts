import { UserModule } from '../models/UserModule.model';

export class UserModuleQueries {
  static async findAll(userId?: string, isActive?: boolean): Promise<UserModule[]> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    return await UserModule.findAll({
      where,
      order: [['moduleName', 'ASC']],
    });
  }

  static async findById(id: string): Promise<UserModule | null> {
    return await UserModule.findByPk(id);
  }

  static async findByUserAndModule(userId: string, moduleKey: string): Promise<UserModule | null> {
    return await UserModule.findOne({
      where: { userId, moduleKey },
    });
  }

  static async create(data: {
    userId: string;
    moduleKey: string;
    moduleName: string;
    isActive?: boolean;
  }): Promise<UserModule> {
    return await UserModule.create(data);
  }

  static async update(
    id: string,
    data: {
      moduleName?: string;
      isActive?: boolean;
    }
  ): Promise<[number]> {
    return await UserModule.update(data, {
      where: { id },
    });
  }

  static async delete(id: string): Promise<number> {
    return await UserModule.destroy({
      where: { id },
    });
  }

  static async deleteByUserAndModule(userId: string, moduleKey: string): Promise<number> {
    return await UserModule.destroy({
      where: { userId, moduleKey },
    });
  }

  static async findByUser(userId: string, isActive?: boolean): Promise<UserModule[]> {
    const where: any = { userId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    return await UserModule.findAll({
      where,
      order: [['moduleName', 'ASC']],
    });
  }
}

