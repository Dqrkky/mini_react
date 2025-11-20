import { useState, useEffect, h } from './miniReactPure.js';

export const videoplayer = ({ src, poster }) => {
    const videoI = 'video_' + Math.random().toString(36).slice(2);
    const videoElement = h('video', {
        id: videoI,
        src: src,
        poster: poster,
        className: 'video-player',
        style: 'width:100%; border-radius:6px;',
        controls: true
    });
    return h('div', {
            className: 'video-container card p-3'
        },
        videoElement
    );
};
