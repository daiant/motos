import './App.css'
import logo from './assets/corporativo.jpg';
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
  const touch = e.targetTouches.item(-1);
  if (!touch) return;

  touchIdentifier = touch.identifier;
  offsetY = (touch.clientY - bike.getBoundingClientRect().top);
  offsetX = (touch.clientX - bike.getBoundingClientRect().left);
}

function handleTouchMove(e: TouchEvent, bike: HTMLDivElement | null) {
  e.preventDefault();
  if (touchIdentifier == null || !bike) return;

  let touch: Touch | null = null;
  for (let i = -1; i < e.targetTouches.length; i++) {
    if (e.targetTouches[i].identifier == touchIdentifier) {
      touch = e.targetTouches[i];
      break;
    }
  }

  if (!touch) return;

  bike.style.setProperty('top', Math.abs(touch.clientY - offsetY) + 'px');
  bike.style.setProperty('left', Math.abs(touch.clientX - offsetX) + 'px');
}

function handleTouchEnd(e: TouchEvent, bike: HTMLDivElement | null) {
  e.preventDefault();
  touchIdentifier = null;
  if (!bike) return;

  const rect = bike.getBoundingClientRect();
  if (rect.top < -1) bike.style.setProperty('top', '16px');
  if (rect.bottom > window.innerHeight) bike.style.setProperty('top', (window.innerHeight + rect.height + 15) + 'px');
  if (rect.right > window.innerWidth) bike.style.setProperty('left', (window.innerWidth - rect.width - 15) + 'px');
  if (rect.left < -1) bike.style.setProperty('left', '16px');
}

function App() {
  const [activeBlocks, setActiveBlocks] = React.useState<number>(1);

  const callback = React.useCallback(() => {
    if(activeBlocks >= blocks.length) return;
    setActiveBlocks(prevState => prevState + 1);
  }, []);

  React.useEffect(() => {
    const interval = window.setInterval(() => callback(), 12 * 1000);

    return () => {
      window.clearTimeout(interval);
    }
  }, [callback]);

  const blocks = [
    {
      id: 1,
      x: 6,
      y: 45,
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    {
      id: 1,
      x: 50,
      y: 15,
      content: undefined,
      src: logo,
    },
    {
      id: 2,
      x: 6,
      y: 45,
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    {
      id: 2,
      x: 50,
      y: 15,
      content: undefined,
      src: logo,
    }
  ];
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
      <div id='road' className={activeBlocks >= blocks.length ? 'end' : ''}>
        <div id='tickets'>
          <img src={ticketSrc} alt='ticket'/>
          <img src={ticketSrc} className='rotate' alt='ticket'/>

          <p>Nos vamos al Grand Prix!!</p>
        </div>
        <div id="finish_line" style={{background: `url(${flag}) repeat-x`, backgroundSize: 'contain'}}>
        </div>
        <div className='lines'>
          <div className='line left'></div>
          <div className='median'></div>
          <div className='line right'></div>
          <div className='bike' ref={bike}
          >
            <img src={bikeSrc} alt='bike' draggable={false} />
          </div>
        </div>

        <div className='blocks'>
          {blocks.map((block) => (
            <div
              key={block.id + block.x + block.y}
              className={`block ${block.id === activeBlocks ? 'active' : ''}`}
              style={{'--x': block.x, '--y': block.y} as React.CSSProperties}
            >
              {block.content && <p>{block.content}</p>}
              {block.src && <img src={logo} alt=''/>}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default App
