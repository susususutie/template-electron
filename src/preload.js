// 此处代码执行在隔离的独立环境中, 此处的window也不是渲染器进程的window
// 通过 exposeInMainWorld 将部分属性, 方法暴露在渲染进程的window对象上
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

// 挂载到渲染进程的window上, renderer.js中可通过window.electronAPI访问
contextBridge.exposeInMainWorld("electronAPI", {
  // 1. renderer 间接触发主进程事件, 无返回值
  // renderer 通过调用 window上挂载的 api, 触发主进程的事件
  // electronAPI.callXXX
  // 这些 api 是在 preload.js 中挂载的, api 的调用旨在触发主进程的指定事件
  // electronAPI.callXXX: () => ipcRenderer.send('yyy')
  // 在主进程中监听这个事件, 并做出相应操作
  // ipcMain.on('yyy', handleYYY)
  sendSetTitle: (title) => ipcRenderer.send("set-title", title),

  // 2. renderer 间接触发主进程事件, 返回值是一个Promise
  invokeOpenFile: () => ipcRenderer.invoke("dialog:openFile"),

  // 3. renderer 提前监听 api 上的事件, 当主进程主动触发事件, 通过 preload 中转后, 触发渲染进程的事件函数.
  // window.electronAPI.onUpdateCounter 只应该调用一次, 若注册多个回调会多次调用
  onUpdateCounter: (callback) => ipcRenderer.on('update-counter', callback),
  // addEventListener: (event, callback) => ipcRenderer.on(event, callback),
});
