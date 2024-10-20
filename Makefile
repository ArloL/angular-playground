build:
	mkdir -p _site
	npm run build
	rsync --archive --verbose --delete dist/my-app/browser/ _site/angular-playground/
server:
	ng serve --open
