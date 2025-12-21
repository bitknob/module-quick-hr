import { Menu } from '../models/Menu.model';
import { MenuRole } from '../models/MenuRole.model';
import { Op } from 'sequelize';

export class MenuQueries {
  static async findAll(includeInactive: boolean = false): Promise<Menu[]> {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }
    return await Menu.findAll({
      where,
      include: [
        {
          model: Menu,
          as: 'childMenus',
          required: false,
          where: includeInactive ? {} : { isActive: true },
          include: [
            {
              model: MenuRole,
              as: 'menuRoles',
              required: false,
            },
          ],
        },
        {
          model: MenuRole,
          as: 'menuRoles',
          required: false,
        },
      ],
      order: [['displayOrder', 'ASC'], ['label', 'ASC']],
    });
  }

  static async findById(id: string): Promise<Menu | null> {
    return await Menu.findByPk(id, {
      include: [
        {
          model: Menu,
          as: 'childMenus',
          required: false,
          where: { isActive: true },
          include: [
            {
              model: MenuRole,
              as: 'menuRoles',
              required: false,
            },
          ],
        },
        {
          model: MenuRole,
          as: 'menuRoles',
          required: false,
        },
      ],
    });
  }

  static async findByRole(roleKey: string): Promise<Menu[]> {
    const menus = await Menu.findAll({
      where: {
        isActive: true,
        parentId: {
          [Op.is]: null,
        },
      } as any,
      include: [
        {
          model: MenuRole,
          as: 'menuRoles',
          where: { roleKey },
          required: true,
        },
      ],
      order: [['displayOrder', 'ASC'], ['label', 'ASC']],
    });

    for (const menu of menus) {
      const menuId = menu.get('id') || (menu as any).id;
      if (!menuId) {
        continue;
      }
      const childMenus = await Menu.findAll({
        where: {
          parentId: menuId,
          isActive: true,
        },
        include: [
          {
            model: MenuRole,
            as: 'menuRoles',
            where: { roleKey },
            required: true,
          },
        ],
        order: [['displayOrder', 'ASC'], ['label', 'ASC']],
      });
      (menu as any).childMenus = childMenus;
    }

    return menus;
  }

  static async create(data: {
    id: string;
    label: string;
    path: string;
    icon?: string;
    parentId?: string;
    displayOrder?: number;
    isActive?: boolean;
  }): Promise<Menu> {
    return await Menu.create(data);
  }

  static async update(
    id: string,
    data: {
      label?: string;
      path?: string;
      icon?: string;
      parentId?: string;
      displayOrder?: number;
      isActive?: boolean;
    }
  ): Promise<[number]> {
    return await Menu.update(data, {
      where: { id },
    });
  }

  static async delete(id: string): Promise<number> {
    return await Menu.destroy({
      where: { id },
    });
  }

  static async assignRole(menuId: string, roleKey: string): Promise<MenuRole> {
    return await MenuRole.create({ menuId, roleKey });
  }

  static async removeRole(menuId: string, roleKey: string): Promise<number> {
    return await MenuRole.destroy({
      where: { menuId, roleKey },
    });
  }

  static async getMenuRoles(menuId: string): Promise<MenuRole[]> {
    return await MenuRole.findAll({
      where: { menuId },
    });
  }

  static async removeAllRoles(menuId: string): Promise<number> {
    return await MenuRole.destroy({
      where: { menuId },
    });
  }
}

