build:
	mkdir -p _site
	npm run build
	rsync --archive --verbose --delete dist/my-app/browser/ _site
server:
	ng serve --open
