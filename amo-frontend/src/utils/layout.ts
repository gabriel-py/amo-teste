import type { IRouteMenu } from '@/models/layout';
import { pathToRegexp } from 'path-to-regexp';

const testRouteParam = (currentPath: string, routePath?: string) => {
  if (!routePath) {
    return false;
  }

  const splited = currentPath.split('/');
  // eslint-disable-next-line
  if (~~splited[splited.length - 1] !== 0) {
    splited.pop();
    return splited.join('/') === routePath;
  }
  return false;
};

const getUserMatchedRoute = (pathname: string | undefined, userRoutes: any[]) => {
  if (!pathname) {
    return null;
  }
  for (let i = 0; i < userRoutes.length; i += 1) {
    if (pathname === userRoutes[i].path) {
      return userRoutes[i];
    }
  }
  return null;
};

const containsPath = (pathname: string, userRoutes: any[]) => {
  for (let i = 0; i < userRoutes.length; i += 1) {
    if (pathname === userRoutes[i].path) {
      return true;
    }
  }
  return false;
};

export const getRoutes = (routes: IRouteMenu[], userRoutes: any[]) => {
  return routes
    .filter((route: IRouteMenu) => containsPath(route.path || '/', userRoutes))
    .map((route: IRouteMenu) => {
      const routeMenu = { ...route };

      if (routeMenu.routes) {
        routeMenu.routes = getRoutes(route.routes || [], userRoutes);
      } else {
        routeMenu.routes = [];
      }

      const userMatched = getUserMatchedRoute(route.path, userRoutes);
      if (userMatched) {
        if (userMatched.name) {
          routeMenu.name = userMatched.name;
        }

        if (userMatched.bi && routeMenu.routes) {
          for (let i = 0; i < userMatched.bi.length; i += 1) {
            routeMenu.routes.push({
              exact: true,
              name: userMatched.bi[i].name,
              path: userMatched.bi[i].path,
            } as IRouteMenu);
          }
        }
      }

      return routeMenu;
    });
};

export const getCurrentRoute = (path: string, routes: IRouteMenu[], matchs: IRouteMenu[] = []) => {
  routes.forEach((route) => {
    if (route.routes) {
      matchs.concat(getCurrentRoute(path, route.routes, matchs));
    }

    if (
      route.exact &&
      (route.path === path ||
        pathToRegexp(`${route.path}`).test(path) ||
        testRouteParam(path, route.path))
    ) {
      matchs.push(route);
    }
  });

  return matchs;
};

export const getDefaultRoute = (routes: IRouteMenu[]) => {
  const defaults: any = { routes };

  for (let m = 0; m < routes.length; m += 1) {
    if (defaults.currentModule && defaults.currentRoute) {
      break;
    }

    for (let i = 0; i < routes[m].routes.length; i += 1) {
      if (routes[m].routes[i].routes.length) {
        for (let s = 0; s < routes[m].routes[i].routes.length; s += 1) {
          if (routes[m].routes[i].routes[s].default === true) {
            defaults.currentRoute = routes[m].routes[i].routes[s];
            defaults.currentModule = routes[m];
            // eslint-disable-next-line no-param-reassign
            routes[m].routes[i].expanded = true;
            defaults.routes = routes;
            break;
          }
        }
      } else if (routes[m].routes[i].default === true) {
        defaults.currentRoute = routes[m].routes[i];
        defaults.currentModule = routes[m];
        break;
      }
    }
  }

  return defaults;
};