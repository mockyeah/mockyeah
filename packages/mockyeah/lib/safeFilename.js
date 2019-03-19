const safeFilename = filename => filename.replace(/^(\w+:)?[/\\]+/, '').replace(/\.\.[/\\]/g, '');

module.exports = safeFilename;
