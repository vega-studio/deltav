import { Demo } from './demo';

async function start() {
  const container = document.getElementById('main');
  if (!container) return;

  const app = new Demo({
    container,
  });

  await app.init();
}

start();
