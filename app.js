import { 
  h,
  useState,
  useEffect,
  route,
  getCurrentRouteEffectStore,
  getCurrentRouteStateStore,
  getCurrentComponentId,
  buildNav
} from './miniReactPure.js';
import { videoplayer } from './videoohandler.js';
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.12.2/+esm';

function Card({ title, body }) {
  return h('div', { className: 'card mb-3' },
    h('div', { className: 'card-body' },
      h('h5', { className: 'card-title' }, title),
      h('p', { className: 'card-text' }, body)
    )
  );
}

function Home() {
  //const [count, setCount] = useState(0);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/posts?_limit=5')
      .then(res => setPosts(res.data))
      .catch(err => setPosts([{ title: 'Error', body: err.message }]));
  }, []);

  return h('div', {},
    h('h2', {}, 'Home Page'),
    // h('div', { className: 'mb-3' },
    //   h('p', {}, `Button clicked ${count} times`),
    //   h('button', {className: 'btn btn-primary', onClick: () => setCount(count + 1) }, 'Click Me')
    // ),
    h('div', {}, posts.map(post => h(Card, { title: post.title, body: post.body })))
  );
}

function About() {
  return h('div', {},
    h('h2', {}, 'About Page'),
    h('p', {}, 'Pure vanilla JS SPA using mini React framework without JSX.')
  );
}

function VideoPage() {
  return h('div', {},
    h('h2', {}, 'Video Player Page'),
    h(videoplayer, {
      src: 'https://www.w3schools.com/html/mov_bbb.mp4',
      poster: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217'
    })
  );
};

route("/", Home, {
  label: "Home",
  icon: "bi bi-house",
  group: "main",
  order: 1
});

route("/about", About, {
  label: "About",
  icon: "bi bi-info-circle",
  group: "main",
  order: 2
});

route("/video", VideoPage, {
  label: "Videos",
  icon: "bi bi-camera-video",
  group: "media",
  order: 1
});

buildNav('.navbar-nav');
