import { Menu } from './Menu.model';
import { MenuRole } from './MenuRole.model';

// Define relationships after both models are initialized
// This file should be imported after Menu and MenuRole models are loaded
export function setupMenuAssociations() {
  Menu.hasMany(MenuRole, {
    foreignKey: 'menuId',
    as: 'menuRoles',
  });

  MenuRole.belongsTo(Menu, {
    foreignKey: 'menuId',
    as: 'menu',
  });
}

