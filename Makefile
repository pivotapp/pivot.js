release: build build/build.min.js
	cp build/build.js pivot.js
	cp build/build.min.js pivot.min.js

build: components util.js browser.js
	@./node_modules/.bin/component build --standalone pivot

build/build.min.js: build/build.js
	@./node_modules/.bin/uglifyjs --compress --mangle -o build/build.min.js build/build.js

components: component.json
	@./node_modules/.bin/component install

clean:
	rm -fr build components

.PHONY: clean build prod
