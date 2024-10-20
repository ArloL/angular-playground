build:
	mkdir -p _site
	npm run build
	rsync --archive --verbose --delete dist/apezzi/browser/ _site
server:
	ng serve --open
