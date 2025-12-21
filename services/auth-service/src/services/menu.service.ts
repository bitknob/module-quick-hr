import { UserRole } from '@hrm/common';
import { MenuQueries } from '../queries/menu.queries';
import { Menu } from '../models/Menu.model';
import { MenuRole } from '../models/MenuRole.model';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
  roles: UserRole[];
}

export type MenuItemWithoutRoles = {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: MenuItemWithoutRoles[];
};

export class MenuService {
  static async getMenuForRole(role: UserRole): Promise<MenuItemWithoutRoles[]> {
    const roleKey = role as string;
    const menus = await MenuQueries.findByRole(roleKey);

    if (!menus || menus.length === 0) {
      return [];
    }

    const result = this.buildMenuTree(menus, roleKey);
    return result;
  }

  private static buildMenuTree(menus: Menu[], roleKey: string): MenuItemWithoutRoles[] {
    return menus
      .map((menu): MenuItemWithoutRoles | null => {
        const menuData = menu.toJSON ? menu.toJSON() : (menu as any);
        const menuId = menuData.id;
        const menuLabel = menuData.label;
        const menuPath = menuData.path;
        const menuIcon = menuData.icon;

        if (!menuId || !menuLabel || !menuPath) {
          return null;
        }

        const menuItem: MenuItemWithoutRoles = {
          id: menuId,
          label: menuLabel,
          path: menuPath,
        };

        if (menuIcon) {
          menuItem.icon = menuIcon;
        }

        const childMenus = menuData.childMenus || (menu as any).childMenus || [];
        if (childMenus && childMenus.length > 0) {
          const accessibleChildren = childMenus
            .map((child: any) => {
              return child.toJSON ? child.toJSON() : child;
            })
            .filter((childData: any) => {
              const childMenuRoles = childData.menuRoles || [];
              return childMenuRoles.some((mr: any) => {
                const mrData = mr.toJSON ? mr.toJSON() : mr;
                return mrData.roleKey === roleKey;
              });
            })
            .map((childData: any): MenuItemWithoutRoles => {
              const childItem: MenuItemWithoutRoles = {
                id: childData.id,
                label: childData.label,
                path: childData.path,
              };
              if (childData.icon) {
                childItem.icon = childData.icon;
              }
              return childItem;
            });

          if (accessibleChildren.length > 0) {
            menuItem.children = accessibleChildren;
          }
        }

        return menuItem;
      })
      .filter((item): item is MenuItemWithoutRoles => item !== null);
  }

  static async getAllMenus(includeInactive: boolean = false): Promise<Menu[]> {
    return await MenuQueries.findAll(includeInactive);
  }

  static async getMenuById(id: string): Promise<Menu | null> {
    return await MenuQueries.findById(id);
  }

  static async createMenu(data: {
    id: string;
    label: string;
    path: string;
    icon?: string;
    parentId?: string;
    displayOrder?: number;
    isActive?: boolean;
    roleKeys?: string[];
  }): Promise<Menu> {
    const menu = await MenuQueries.create({
      id: data.id,
      label: data.label,
      path: data.path,
      icon: data.icon,
      parentId: data.parentId,
      displayOrder: data.displayOrder ?? 0,
      isActive: data.isActive ?? true,
    });

    if (data.roleKeys && data.roleKeys.length > 0) {
      for (const roleKey of data.roleKeys) {
        await MenuQueries.assignRole(menu.id, roleKey);
      }
    }

    return menu;
  }

  static async updateMenu(
    id: string,
    data: {
      label?: string;
      path?: string;
      icon?: string;
      parentId?: string;
      displayOrder?: number;
      isActive?: boolean;
    }
  ): Promise<Menu | null> {
    await MenuQueries.update(id, data);
    return await MenuQueries.findById(id);
  }

  static async deleteMenu(id: string): Promise<void> {
    await MenuQueries.removeAllRoles(id);
    await MenuQueries.delete(id);
  }

  static async assignRoleToMenu(menuId: string, roleKey: string): Promise<MenuRole> {
    return await MenuQueries.assignRole(menuId, roleKey);
  }

  static async removeRoleFromMenu(menuId: string, roleKey: string): Promise<void> {
    await MenuQueries.removeRole(menuId, roleKey);
  }

  static async getMenuRoles(menuId: string): Promise<MenuRole[]> {
    return await MenuQueries.getMenuRoles(menuId);
  }
}
