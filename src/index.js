const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  // 菜单相关文档:
  // https://www.electronjs.org/zh/docs/latest/api/menu-item
  const menu = Menu.buildFromTemplate([
    {
      label: "&File",
      role: "fileMenu",
    },
    {
      label: "&Edit",
      role: "editMenu",
    },
    {
      label: "&View",
      role: "viewMenu",
    },
    {
      label: "&Window",
      role: "windowMenu",
    },
    {
      label: "&Custom",
      submenu: [
        {
          type: "normal",
          label: app.name,
        },
        {
          type: "separator",
        },
        {
          type: "checkbox",
          label: "勾选项",
          checked: true, // 选中后, label 前有 √ 图标
        },
        {
          type: "submenu",
          label: "单选项",
          submenu: [
            {
              type: "radio",
              label: "1",
              checked: false,
            },
            {
              type: "radio",
              label: "2",
              checked: true,
            },
          ],
        },
        {
          type: "separator",
        },
        {
          click: () => mainWindow.webContents.send("update-counter", 1),
          label: "加 1",
        },
        {
          click: () => mainWindow.webContents.send("update-counter", -1),
          label: "减 1",
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "./index.html"));

  // 可打开多个渲染进程(多窗口)
  // setTimeout(() => {
  //   const otherWindow = new BrowserWindow({
  //     width: 300,
  //     height: 300,
  //     // webPreferences: {
  //     //   preload: path.join(__dirname, 'windows/other/preload.js'),
  //     // },
  //   });
  //   otherWindow.loadFile(path.join(__dirname, 'windows/other/index.html'));
  // }, 3000);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

function handleSetTitle(event, title) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  ipcMain.on("counter-value", (_event, value) => {
    console.log(value); // will print value to Node console
  });
  win.setTitle("$main$ " + title);
}

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog();
  if (canceled) {
  } else {
    return filePaths[0];
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.once("ready", () => {
  ipcMain.on("set-title", handleSetTitle);
  ipcMain.handle("dialog:openFile", handleFileOpen);
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.once("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.once("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
