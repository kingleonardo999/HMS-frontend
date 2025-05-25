/// <reference types="vite/client" />
declare module 'nprogress'
declare module '@wangeditor/editor-for-vue' {
  import { Component } from 'vue';

  const Editor: Component;
  const Toolbar: Component;

  export { Editor, Toolbar };
}