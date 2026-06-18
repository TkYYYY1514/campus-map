import Dexie from 'dexie';

const db = new Dexie('CampusMapDB_v2');

db.version(1).stores({
  poi_data: 'id, name, type, is_visible, x, y, created_at, updated_at',
  routes: 'id, name, is_active, created_at, updated_at',
  route_nodes: 'id, route_id, poi_id, node_order',
  road_network: 'id, from_poi_id, to_poi_id, [from_poi_id+to_poi_id], distance',
  users: 'id, username, password, [username+password], role, created_at',
  comments: 'id, poi_id, user_id, username, content, likes, is_pinned, created_at',
  comment_likes: 'id, comment_id, user_id, [comment_id+user_id]'
});

const SEED_VERSION = '1.0.2';

const loadSeedData = async () => {
  const seedVersion = localStorage.getItem('seed_version');
  
  if (seedVersion === SEED_VERSION) {
    const count = await db.poi_data.count();
    if (count > 0) return;
  }

  try {
    const [pois, routes, routeNodes, roadNetwork, users, comments, commentLikes] = await Promise.all([
      fetch('/seed/poi_data.json').then(r => r.json()),
      fetch('/seed/routes.json').then(r => r.json()),
      fetch('/seed/route_nodes.json').then(r => r.json()),
      fetch('/seed/road_network.json').then(r => r.json()),
      fetch('/seed/users.json').then(r => r.json()),
      fetch('/seed/comments.json').then(r => r.json()),
      fetch('/seed/comment_likes.json').then(r => r.json())
    ]);

    await db.transaction('rw', db.poi_data, db.routes, db.route_nodes, db.road_network, db.users, db.comments, db.comment_likes, async () => {
      await db.poi_data.clear();
      await db.routes.clear();
      await db.route_nodes.clear();
      await db.road_network.clear();
      await db.users.clear();
      await db.comments.clear();
      await db.comment_likes.clear();
      
      for (const item of pois) {
        await db.poi_data.add(item);
      }
      for (const item of routes) {
        await db.routes.add(item);
      }
      for (const item of routeNodes) {
        await db.route_nodes.add(item);
      }
      for (const item of roadNetwork) {
        await db.road_network.add(item);
      }
      for (const item of users) {
        await db.users.add(item);
      }
      for (const item of comments) {
        await db.comments.add(item);
      }
      for (const item of commentLikes) {
        await db.comment_likes.add(item);
      }
    });

    localStorage.setItem('seed_version', SEED_VERSION);
    console.log('Seed data loaded successfully');
  } catch (error) {
    console.error('Failed to load seed data:', error);
  }
};

const initDB = async () => {
  await db.open();
  await loadSeedData();
};

const euclideanDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const findNearestWaypoint = (x, y, waypoints) => {
  let nearest = null;
  let minDist = Infinity;
  for (const wp of waypoints) {
    const dist = euclideanDistance({ x, y }, wp);
    if (dist < minDist) {
      minDist = dist;
      nearest = wp;
    }
  }
  return { nearest, distance: minDist };
};

const findShortestPath = (start, end, graph) => {
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(graph));
  
  for (const node of unvisited) {
    distances[node] = Infinity;
  }
  distances[start] = 0;
  
  while (unvisited.size > 0) {
    let current = null;
    let minDist = Infinity;
    for (const node of unvisited) {
      if (distances[node] < minDist) {
        minDist = distances[node];
        current = node;
      }
    }
    
    if (current === null || distances[current] === Infinity) break;
    
    unvisited.delete(current);
    
    if (current === end) break;
    
    const neighbors = graph[current] || [];
    for (const neighbor of neighbors) {
      const alt = distances[current] + neighbor.distance;
      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
        previous[neighbor.to] = current;
      }
    }
  }
  
  const path = [];
  let curr = end;
  while (curr !== undefined) {
    path.unshift(curr);
    curr = previous[curr];
  }
  
  if (path.length === 1 && path[0] !== start) {
    return null;
  }
  
  return {
    nodes: path,
    distance: distances[end]
  };
};

const getMultipleRoutes = (start, end, graph, k = 3) => {
  const routes = [];
  const tempGraph = JSON.parse(JSON.stringify(graph));
  
  for (let i = 0; i < k; i++) {
    const path = findShortestPath(start, end, tempGraph);
    if (!path || path.nodes.length < 2) break;
    
    routes.push(path);
    
    for (let j = 0; j < path.nodes.length - 1; j++) {
      const from = path.nodes[j];
      const to = path.nodes[j + 1];
      if (tempGraph[from]) {
        tempGraph[from] = tempGraph[from].filter(n => n.to !== to);
      }
    }
  }
  
  return routes;
};

export {
  db,
  initDB,
  euclideanDistance,
  findNearestWaypoint,
  findShortestPath,
  getMultipleRoutes
};

export default db;