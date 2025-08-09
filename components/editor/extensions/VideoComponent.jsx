"use client";

import React, { useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

export default function VideoComponent({ node, updateAttributes, selected }) {
  const videoRef = useRef(null);
  const { src, type, controls = true, preload = 'metadata', class: className = 'max-w-full h-auto my-4 rounded-md', playsinline = true } = node.attrs || {};

  // Prevent React re-renders from resetting playback while typing
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    // Avoid focus stealing
    el.setAttribute('tabindex', '-1');
  }, []);

  return (
    <NodeViewWrapper className="my-2 tiptap-video" contentEditable={false}>
      <video
        ref={videoRef}
        src={src}
        className={className}
        controls={controls}
        preload={preload}
        playsInline={playsinline}
        crossOrigin="anonymous"
      >
        {type ? <source src={src} type={type} /> : null}
      </video>
    </NodeViewWrapper>
  );
}


