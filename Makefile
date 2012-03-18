test:
	./node_modules/mocha/bin/mocha \
		--reporter list \
		--timeout 5000

.PHONY: test