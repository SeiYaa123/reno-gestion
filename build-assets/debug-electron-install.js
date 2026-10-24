const { downloadArtifact } = require('@electron/get');
const extract = require('extract-zip');
const path = require('path');
const { version } = require('../node_modules/electron/package.json');

async function main() {
	console.log('Démarrage, version =', version);
	const zipPath = await downloadArtifact({
		version,
		artifactName: 'electron',
		platform: 'win32',
		arch: 'x64'
	});
	console.log('Zip obtenu:', zipPath);
	const distDir = path.join(__dirname, '..', 'node_modules', 'electron', 'dist');
	console.log('Extraction vers:', distDir);
	await extract(zipPath, { dir: distDir });
	console.log('Extraction terminée.');
}

main().catch((err) => {
	console.error('ERREUR:', err);
	process.exitCode = 1;
});
