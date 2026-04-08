.PHONY: build

build:
	@echo "Installing dependencies..."
	@. $(HOME)/.nvm/nvm.sh && npm install
	
	@echo "Building debug version..."
	@. $(HOME)/.nvm/nvm.sh && npm run build:debug
	@cp dist/index.html ./index_debug.html
	
	@echo "Building production version..."
	@. $(HOME)/.nvm/nvm.sh && npm run build:prod
	@cp dist/index.html ./index.html
	
	@echo "Build complete! (dist/ folder can be ignored)"
