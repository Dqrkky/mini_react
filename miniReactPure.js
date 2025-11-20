window.config = {
  "routes": {},
  "stateStore": new Map(),
  "effectStore": new Map(),
  "currentComponentId": null,
  "effectIndex": 0
};

export const useState = (initialValue) => {
  const id = window.config.currentComponentId + '_' + window.config.effectIndex++;
  if (!window.config.stateStore.has(id)) window.config.stateStore.set(id, initialValue);
  const setState = (newValue) => {
    window.config.stateStore.set(id, newValue);
    reRender();
  }

  return [window.config.stateStore.get(id), setState];
}

export const useEffect = (callback, deps = []) => {
  const id = window.config.currentComponentId + '_effect_' + window.config.effectIndex++;
  const old = window.config.effectStore.get(id);

  let hasChanged = true;
  if (old) {
    const [oldDeps] = old;
    hasChanged = !deps.every((d, i) => d === oldDeps[i]);
  }

  if (hasChanged) callback();
  window.config.effectStore.set(id, [deps]);
}

export const h = (tag, props = {}, ...children) => {
  if (typeof tag === 'function') return tag({ ...props, children });
  const el = document.createElement(tag);
  for (let key in props) {
    if (key.startsWith('on') && typeof props[key] === 'function') {
      el.addEventListener(key.substring(2).toLowerCase(), props[key]);
    } else if (key === 'className') el.className = props[key];
    else el.setAttribute(key, props[key]);
  }
  children.flat().forEach(child => {
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    } else if (Array.isArray(child)) {
      child.forEach(c => el.appendChild(c));
    }
  });
  return el;
}

export const route = (path, component, opts = {}) => {
  window.config = window.config || {};
  window.config.routes = window.config.routes || {};
  window.config.routes[path] = {
    component,
    label: opts.label || null,
    icon: opts.icon || null,
    group: opts.group || null,
    order: opts.order ?? 999
  };
};

export const NotFound = () => {
  return h('div', {}, h('h2', {}, '404'), h('p', {}, 'Page not found'));
}

export const getCurrentRoute = () => {
  return location.hash.slice(1) || '/';
}

export const getCurrentComponentId = () => window.config.currentComponentId;

export const getCurrentRouteStateStore = (currentComponentId) => {
  return Object.fromEntries(
    [...window.config.stateStore].filter(
      ([k]) => k.startsWith(currentComponentId + '_')
    )
  );
}

export const getCurrentRouteEffectStore = (currentComponentId) => {
  return Object.fromEntries(
    [...window.config.effectStore].filter(
      ([k]) => k.startsWith(currentComponentId + '_')
    )
  );
}

export const resolveRoute = () => {
  const rawHash = location.hash.slice(1) || '/';
  const [pathPart, queryPart] = rawHash.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryPart));
  const routes = window.config.routes;
  for (const route in routes) {
    const routeSegments = route.split('/').filter(Boolean);
    const urlSegments = pathPart.split('/').filter(Boolean);
    if (routeSegments.length !== urlSegments.length) continue;
    let params = {};
    let match = true;
    for (let i = 0; i < routeSegments.length; i++) {
      const rSeg = routeSegments[i];
      const uSeg = urlSegments[i];
      if (rSeg.startsWith(':')) params[rSeg.slice(1)] = uSeg;
      else if (rSeg !== uSeg) {
        match = false;
        break;
      }
    }
    if (match) {
      const comp = routes[route]?.component;
      return {
        route,
        component: typeof comp === 'function' ? comp : NotFound,
        params,
        query
      };
    }
  }
  return {
    route: '/404',
    component: NotFound,
    params: {},
    query: {}
  };
};

export const reRender = () => {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const { route, params, query, component } = resolveRoute();
  window.config.currentComponentId = component.name;
  window.config.effectIndex = 0;
  highlightActiveMenu(route);
  const el = component({ params, query });
  app.appendChild(el);
};

export const buildNav = (componentSelector) => {
  const nav = document.querySelector(componentSelector);
  if (!nav) return;
  nav.innerHTML = "";
  const routes = window.config.routes || {};
  const groups = {};
  Object.keys(routes).forEach(path => {
    if (path.includes(":")) return;
    const r = routes[path];
    const group = r.group || path.split("/")[1] || "main";
    if (!groups[group]) groups[group] = [];
    groups[group].push({ path, ...r });
  });
  Object.keys(groups).forEach(group => {
    groups[group].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.label.localeCompare(b.label);
    });
  });
  Object.keys(groups).forEach(group => {
    const items = groups[group];
    if (group === "main" || items.length === 1) {
      items.forEach(addNavItem(nav));
      return;
    }
    const dropdown = document.createElement("li");
    dropdown.className = "nav-item dropdown";
    dropdown.innerHTML = `
      <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
        ${capitalize(group)}
      </a>
      <ul class="dropdown-menu"></ul>
    `;
    const menu = dropdown.querySelector(".dropdown-menu");
    items.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <a class="dropdown-item" href="#${item.path}">
          ${item.icon ? `<i class="${item.icon}"></i>` : ""} ${item.label}
        </a>`;
      menu.appendChild(li);
    });
    nav.appendChild(dropdown);
  });
};

function addNavItem(nav) {
  return ({ path, label, icon }) => {
    const li = document.createElement("li");
    li.className = "nav-item";
    nav.appendChild(li);

    const a = document.createElement("a");
    a.className = "nav-link";
    a.href = `#${path}`;
    a.innerHTML = `${icon ? `<i class="${icon}"></i>` : ""} ${label}`;
    li.appendChild(a);
  };
}

export function highlightActiveMenu(path) {
  document.querySelectorAll(".nav-link, .dropdown-item").forEach(link => {
    const href = link.getAttribute("href")?.replace("#", "");
    if (href === path) {
      link.classList.add("active");
      // Open parent dropdown
      const parent = link.closest(".dropdown");
      if (parent) parent.classList.add("show");
    } else {
      link.classList.remove("active");
    }
  });
}

window.addEventListener('hashchange', reRender);
window.addEventListener('load', reRender);
