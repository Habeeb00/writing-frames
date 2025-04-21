import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { FaArrowDown } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // For navigation

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const mainRef = useRef<HTMLDivElement>(null);
  const makeRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const sideTextRef = useRef<HTMLDivElement>(null);

  const lines = ["Paste your text", "Download your frame", "Just like that!"];
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    const animateLetters = (element: HTMLElement | null, delayOffset = 0) => {
      if (!element) return;
      const letters = [...(element.textContent ?? '')];
      element.textContent = '';

      letters.forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(100%)';
        element.appendChild(span);

        gsap.to(span, {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: delayOffset + i * 0.05,
          ease: 'power4.out',
        });
      });
    };

    if (!mainRef.current) return;

    const ctx = gsap.context(() => {
      animateLetters(makeRef.current, 0);
      animateLetters(notesRef.current, 0.4);

      gsap.fromTo(
        blobRef.current,
        { y: 0 },
        {
          y: 'random(-30, 30)',
          x: 'random(-20, 20)',
          rotate: 'random(-10, 10)',
          repeat: -1,
          yoyo: true,
          duration: 4,
          ease: 'sine.inOut',
        }
      );

      gsap.fromTo(
        '.subtitle',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1, delay: 1.2, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.cta-button',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1, delay: 1.5, ease: 'power3.out' }
      );
    }, mainRef);

    const startTyping = async () => {
      await new Promise(res => setTimeout(res, 2500));

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let currentLine = '';
        for (let j = 0; j < line.length; j++) {
          currentLine += line[j];
          setTypedLines(prev => [...prev.slice(0, i), currentLine]);
          await new Promise(res => setTimeout(res, 50));
        }
        await new Promise(res => setTimeout(res, 200));
      }

      setShowCursor(true);
    };

    startTyping();

    return () => ctx.revert();
  }, []);

  const handleGetStarted = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        onGetStarted();
      },
    });

    tl.to(
      [makeRef.current, notesRef.current, sideTextRef.current],
      {
        y: -50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.in',
      }
    ).to(
      blobRef.current,
      {
        scale: 2,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in',
      },
      '-=0.3'
    );
  };

  return (
    <div ref={mainRef} className="relative min-h-screen bg-[#0c0c0c] overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0c0c0c] border-b border-gray-700">
  <div className="px-14 mx-auto py-4 flex items-left">
    <Link
      to="/"
      className="text-white text-2xl font-regular tracking-tight"
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
    >
      noteee
    </Link>
  </div>
</nav>


      {/* Blob */}
      <div
        ref={blobRef}
        className="absolute w-40 h-40 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-full blur-3xl top-[50%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 opacity-40"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-6 pt-20">
        <h1
          className="text-left text-[#f9f6e5] leading-tight font-normal"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <div
            ref={makeRef}
            className="block text-[120px] md:text-[220px] lg:text-[300px] font-normal tracking-wider leading-none mb-2"
          >
            Make
          </div>
          <div
            ref={notesRef}
            className="block text-[120px] md:text-[220px] lg:text-[300px] font-normal tracking-wider leading-none"
          >
            Notes
          </div>
        </h1>

        <p
          className="subtitle text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mt-6 self-end text-right max-w-xs"
          style={{
            fontFamily: 'Inter, monospace',
            fontWeight: 400,
            lineHeight: '1.4'
          }}
        >
          Who wants plain text notes?
          <br />
          Get a cool note frame in a click!
        </p>

        <div className="cta-button mt-8 self-end inline-block rounded-full p-[2px] bg-gradient-to-r from-blue-400 to-indigo-500">
          <button
            onClick={handleGetStarted}
            className="flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white text-lg font-semibold w-full h-full transition-all duration-300 hover:shadow-[0_0_25px_rgba(99,102,241,0.7)]"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Try Noteee for free <FaArrowDown />
          </button>
        </div>
      </div>

      {/* Side Text with Typing */}
      <div
        ref={sideTextRef}
        className="absolute bottom-8 left-11 text-white leading-tight"
        style={{
          fontFamily: 'Inter, monospace',
          fontWeight: 200,
          lineHeight: '1.2',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          fontSize: '6vw',
        }}
      >
        <div className="text-[6vw] sm:text-[5vw] md:text-[3vw] lg:text-[2.5vw] xl:text-[50px]">
          {typedLines[0] ?? ''}
        </div>
        <div className="text-[6vw] sm:text-[5vw] md:text-[3vw] lg:text-[2.5vw] xl:text-[50px]">
          {typedLines[1] ?? ''}
        </div>
        <div className="text-[6vw] sm:text-[5vw] md:text-[3vw] lg:text-[2.5vw] xl:text-[50px]">
          {typedLines[2] ?? ''}
          {showCursor && <span className="blinking-cursor">|</span>}
        </div>
      </div>

      {/* Cursor animation style */}
      <style>
        {`
          .blinking-cursor {
            display: inline-block;
            margin-left: 4px;
            animation: blink 1s step-start infinite;
          }

          @keyframes blink {
            50% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default LandingPage;
