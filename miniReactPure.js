const stateStore = new Map();
const effectStore = new Map();
let currentComponentId = null;
let effectIndex = 0;

export function useState(initialValue) {
  const id = currentComponentId + '_' + effectIndex++;
  if (!stateStore.has(id)) stateStore.set(id, initialValue);

  function setState(newValue) {
    stateStore.set(id, newValue);
    reRender();
  }

  return [stateStore.get(id), setState];
}

export function useEffect(callback, deps = []) {
  const id = currentComponentId + '_effect_' + effectIndex++;
  const old = effectStore.get(id);

  let hasChanged = true;
  if (old) {
    const [oldDeps] = old;
    hasChanged = !deps.every((d, i) => d === oldDeps[i]);
  }

  if (hasChanged) callback();
  effectStore.set(id, [deps]);
}

export function h(tag, props = {}, ...children) {
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

const routes = {};

export function route(path, component) {
  routes[path] = component;
}

export function NotFound() {
  return h('div', {}, h('h2', {}, '404'), h('p', {}, 'Page not found'));
}

function getCurrentRoute() {
  return location.hash.slice(1) || '/';
}

export function reRender() {
  const app = document.getElementById('app');
  const route = getCurrentRoute();
  app.innerHTML = '';
  const Component = routes[route] || NotFound;
  currentComponentId = Component.name;
  effectIndex = 0;
  app.appendChild(Component());
}

window.addEventListener('hashchange', reRender);
window.addEventListener('load', reRender);