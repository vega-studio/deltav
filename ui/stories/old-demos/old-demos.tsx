import React from 'react';
import { Demo } from './demo';
import "./old-demos.scss";

export const OldDemos: React.FC = () => {
  const container = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const target = container.current;
    if (!target) return;

    const app = new Demo({
      container: target
    });

    app.init();
  }, []);

  return <div id="main" ref={container}></div>
}
