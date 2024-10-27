build:
	mkdir -p _site
	npm run build
	cp -f \
		patched-ngsw-worker.js \
		dist/apezzi/browser/ngsw-worker.js
	rsync \
		--archive \
		--verbose \
		--delete \
		dist/apezzi/browser/ \
		_site
server:
	ng serve --open
dist-server:
	python3 -m http.server --bind 127.0.0.1 --directory _site 61476
