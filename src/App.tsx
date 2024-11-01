import './App.css'
import motillo from './assets/motillo.jpg';
import jedula from './assets/jedula.jpg';
import como_llegar from './assets/map.jpg';
import pilotos from './assets/pilotos.jpg';
import circuito from './assets/circuito_colores.jpg';
import calendar from './assets/calendario.jpg';
import bikeSrc from './assets/bike.png';
import flag from './assets/flag.jpg';
import ticketSrc from './assets/ticket.png';
import * as React from "react";

let touchIdentifier: number | null = null;
let offsetY: number = 0;
let offsetX: number = 0;

function handleTouchStart(e: TouchEvent, bike: HTMLDivElement | null) {
  e.preventDefault();
  if (touchIdentifier || !bike) return;
  const touch = e.targetTouches.item(0);
  if (!touch) return;

  touchIdentifier = touch.identifier;
  offsetY = (touch.screenY - bike.getBoundingClientRect().top);
  offsetX = (touch.screenX - bike.getBoundingClientRect().left);
}

function handleTouchMove(e: TouchEvent, bike: HTMLDivElement | null) {
  e.preventDefault();
  if (touchIdentifier == null || !bike) return;

  let touch: Touch | null = null;
  for (let i = 0; i < e.targetTouches.length; i++) {
    if (e.targetTouches[i].identifier == touchIdentifier) {
      touch = e.targetTouches[i];
      break;
    }
  }

  if (!touch) return;

  bike.style.setProperty('top', Math.abs(touch.screenY - offsetY) + 'px');
  bike.style.setProperty('left', Math.abs(touch.screenX - offsetX) + 'px');
}

function handleTouchEnd(e: TouchEvent, bike: HTMLDivElement | null) {
  e.preventDefault();
  touchIdentifier = null;
  if (!bike) return;

  const rect = bike.getBoundingClientRect();
  if (rect.top < -1) bike.style.setProperty('top', '16px');
  if (rect.bottom > window.innerHeight) bike.style.setProperty('top', (window.innerHeight - rect.height - 16) + 'px');
  if (rect.right > window.innerWidth) bike.style.setProperty('left', (window.innerWidth - rect.width - 16) + 'px');
  if (rect.left < -1) bike.style.setProperty('left', '16px');
}

const blockSize = 6;
const blocks = [
  {
    id: 1,
    x: 6,
    y: 45,
    content: '¿Te suena este pueblo?'
  },
  {
    id: 1,
    x: 50,
    y: 15,
    src: jedula,
  },
  {
    id: 2,
    x: 15,
    y: 15,
    // Motillo
    src: motillo,
    size: 'lg',
  },
  {
    id: 3,
    x: 30,
    y: 45,
    // Calendario
    size: 'lg',
    src: calendar,
  },
  {
    id: 3,
    x: 10,
    y: 15,
    content: '¡Ya han salido las fechas!',
  },
  {
    id: 4,
    x: 20,
    y: 55,
    content: '¿Quieres más pistas?',
  },
  {
    id: 4,
    x: 40,
    y: 15,
    content: 'No nos vamos a Australia, tampoco a Japón...',
  },
  {
    id: 5,
    x: 10,
    y: 75,
    size: 'lg',
    // Pilotos
    src: pilotos
  },
  {
    id: 5,
    x: 35,
    y: 30,
    size: 'lg',
    // Circuito
    src: circuito
  },
  {
    id: 6,
    x: 30,
    y: 35,
    // Como llegar
    src: como_llegar,
    size: 'lg'
  },
  {
    id: 6,
    x: 20,
    y: 65,
    content: '¡Tenemos alojamiento!'
  },
  {
    id: 6,
    x: 40,
    y: 15,
    content: 'Y entradas virtuales...'
  },
];

function App() {
  const [activeBlocks, setActiveBlocks] = React.useState<number>(1);

  const callback = React.useCallback(() => {
    if(activeBlocks >= blocks.length) return;
     setActiveBlocks(prevState => prevState + 1);
  }, [activeBlocks]);

  React.useEffect(() => {
    if(activeBlocks > blockSize) return;

    const interval = window.setInterval(() => callback(), 12 * 1000);

    return () => {
      window.clearTimeout(interval);
    }
  }, [callback, activeBlocks]);

  const bike = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    const {signal} = controller;

    bike.current?.addEventListener('touchstart', e => handleTouchStart(e, bike.current), {signal, passive: false});
    bike.current?.addEventListener('touchmove', e => handleTouchMove(e, bike.current), {signal, passive: false});
    bike.current?.addEventListener('touchend', e => handleTouchEnd(e, bike.current), {signal, passive: false});

    let start: DOMHighResTimeStamp | undefined;
    const step = (timestamp: DOMHighResTimeStamp) => {
      if (start === undefined) {
        start = timestamp;
      }
      const blocks = document.querySelectorAll('.block.active');

      blocks.forEach(block => {
        const rect = block.getBoundingClientRect();
        const bikeRect = bike.current!.getBoundingClientRect();

        if (
          (
            bikeRect.left >= rect.left && bikeRect.left <= rect.right
            ||
            bikeRect.right <= rect.right && bikeRect.right >= rect.left
          ) &&
          // Y coordinates go inverted
          (
            bikeRect.top >= rect.top && bikeRect.top <= rect.bottom
            ||
            bikeRect.bottom <= rect.bottom && bikeRect.bottom >= rect.top
          )
        ) {
          block.classList.add('vibrate');
        } else {
          block.classList.remove('vibrate');
        }
      });

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);

    return () => {
      controller.abort();
    }

  }, [bike]);

  return (
    <main id='circuit'>
      <div id='road' className={activeBlocks > blockSize ? 'end' : ''}>
        <div id='tickets'>
          <img src={ticketSrc} alt='ticket'/>
          <img src={ticketSrc} className='rotate' alt='ticket'/>
          <p>¡¡Nos vamos a Jerez!!</p>
        </div>
        <div id="finish_line" style={{background: `url(${flag}) repeat-x`, backgroundSize: 'contain'}}>
        </div>
        <div className='lines'>
          <div className='line left'></div>
          <div className='median'></div>
          <div className='line right'></div>
          <div className='bike' ref={bike}>
            <img src={bikeSrc} alt='bike' draggable={false} />
          </div>
        </div>

        <div className='blocks'>
          {blocks.map((block) => (
            <div
              key={'' + block.id + block.x + block.y}
              className={`block ${block.id === activeBlocks ? 'active' : ''}`}
              style={{'--x': block.x, '--y': block.y} as React.CSSProperties}
            >
              {block.content && <p>{block.content}</p>}
              {block.src && <img src={block.src} alt='' className={block.size ?? ''}/>}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default App
