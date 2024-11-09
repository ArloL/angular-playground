build:
	mkdir -p _site
	npm run build -- \
		--base-href /angular-playground/
	rsync \
		--archive \
		--verbose \
		--delete \
		dist/apezzi/browser/ \
		_site
server:
	ng serve --open
dist-server:
	ng serve \
		--configuration=production \
		--open
