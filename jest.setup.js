require('@testing-library/jest-dom');
import React from 'react';
import { COLORS } from './src/constants/chart';

// Mock global objects like IntersectionObserver if needed
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock window.matchMedia which is used in some components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock performance.now()
global.performance.now = jest.fn(() => Date.now());

// Mock SVGPathElement if not available
if (typeof SVGPathElement === 'undefined') {
  class SVGPathElement {
    getTotalLength() {
      return 100;
    }
    getPointAtLength(length) {
      return { x: length, y: length };
    }
  }
  global.SVGPathElement = SVGPathElement;
}

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.CONNECTING = WebSocket.CONNECTING;
    this.OPEN = WebSocket.OPEN;
    this.CLOSING = WebSocket.CLOSING;
    this.CLOSED = WebSocket.CLOSED;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    this.messages = [];
    this.isConnected = false;

    // Simulate connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.isConnected = true;
      this.onopen && this.onopen();
    }, 0);
  }

  send(data) {
    if (!this.isConnected) {
      throw new Error('WebSocket is not connected');
    }
    this.messages.push(data);
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    this.isConnected = false;
    this.onclose && this.onclose();
  }

  // Helper method to simulate receiving a message
  simulateMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }

  // Helper method to simulate connection error
  simulateError(error) {
    if (this.onerror) {
      this.onerror(error);
    }
  }
}

global.WebSocket = MockWebSocket;

// Mock ResizeObserver
class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

global.React = React;
global.COLORS = COLORS; 