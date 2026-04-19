import { useEffect } from 'react';

export default function LoseEffect() {
  useEffect(() => {
    if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
  }, []);

  return <div className="lose-vignette" />;
}
