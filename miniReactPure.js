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

export const route = (path, component) => {
  window.config.routes[path] = component;
}

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

export const reRender = () => {
  const app = document.getElementById('app');
  const route = getCurrentRoute();
  app.innerHTML = '';
  const Component = window.config.routes[route] || NotFound;
  window.config.currentComponentId = Component.name;
  window.config.effectIndex = 0;
  app.appendChild(Component());
}

window.addEventListener('hashchange', reRender);
window.addEventListener('load', reRender);