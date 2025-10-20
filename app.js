import { h, useState, useEffect, route } from './miniReactPure.js';
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
  let currentComponentId = 'Home';
  const [count, setCount] = useState(0);
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
function IPAddress() {
  const [ip, setIp] = useState('Loading...');

  useEffect(() => {
    axios.get('https://api.ipify.org?format=json')
      .then(res => setIp(res.data.ip))
      .catch(err => setIp('Error fetching IP'));
  }, []);
  
  return h('div', {},
    h('h2', {}, 'IP Address Page'),
    h('p', {}, 'Your IP address will be displayed here.'),
    h('p', {}, `Your IP Address is: ${ip}`)
  );
};

route('/', Home);
route('/about', About);
route('/ip', IPAddress);