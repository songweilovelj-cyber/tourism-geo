/// <reference types="amap-js-api" />

declare global {
  interface Window {
    AMap?: typeof AMap
  }
}
