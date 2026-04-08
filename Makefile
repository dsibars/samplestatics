.PHONY: build build-all

APP ?= daily-routine-exercise

build:
	@if [ ! -d "src/$(APP)" ]; then echo "Error: App '$(APP)' not found in src/"; exit 1; fi
	@echo "Building APP: $(APP)..."
	@echo "Installing dependencies..."
	@. $(HOME)/.nvm/nvm.sh && npm install
	
	@echo "Building $(APP) (debug)..."
	@. $(HOME)/.nvm/nvm.sh && APP=$(APP) npm run build:debug
	@cp dist/index.html ./$(APP)_debug.html
	
	@echo "Building $(APP) (production)..."
	@. $(HOME)/.nvm/nvm.sh && APP=$(APP) npm run build:prod
	@cp dist/index.html ./$(APP).html
	@if [ "$(APP)" = "hub" ]; then cp ./hub.html ./index.html; fi
	
	@echo "Build complete for $(APP)!"

build-all:
	@for app in $$(ls src/); do \
		if [ -d "src/$$app" ]; then \
			$(MAKE) build APP=$$app; \
		fi \
	done
	@echo "Successfully built all apps!"
