const { app, BrowserWindow, Menu } = require('electron');
const path = require('node:path');
const http = require('node:http');

const PORT = 3100;

// Dossier de données utilisateur Electron (ex: %APPDATA%\sanitari-co-gestion-chantiers) : fiable
// quel que soit l'endroit où l'app est installée, contrairement au répertoire courant d'un .exe.
process.env.RENO_GESTION_DATA_DIR = app.getPath('userData');

let mainWindow;

function waitForServer() {
	return new Promise((resolve) => {
		const tryOnce = () => {
			const req = http.get(`http://localhost:${PORT}/api/health`, (res) => {
				res.destroy();
				resolve();
			});
			req.on('error', () => setTimeout(tryOnce, 150));
		};
		tryOnce();
	});
}

async function startServer() {
	// dist/server.js démarre Express tout seul dès qu'on le charge (son propre main() interne).
	require('./dist/server.js');
	await waitForServer();
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1320,
		height: 860,
		minWidth: 960,
		minHeight: 620,
		title: 'Sanitari&co — Gestion de chantiers',
		icon: path.join(__dirname, 'build-assets', 'icon.ico'),
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false
		}
	});
	mainWindow.loadURL(`http://localhost:${PORT}/`);
}

app.whenReady().then(async () => {
	Menu.setApplicationMenu(null);
	await startServer();
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	app.quit();
});
