.PHONY: build build-all dsi-build dsi-build-all test-all

APP ?= daily-routine-exercise
STAGING_DIR ?= dist_gh_pages

test-all:
	@echo "Running all RPG Idle Engine tests..."
	@echo "Step 1: Running Unit Tests..."
	@node --test src/rpg-idle/js/engine/tests/unit/*.test.js
	@echo "Step 2: Running Functional Test - Battle System..."
	@node --test src/rpg-idle/js/engine/tests/engine-functional/BattleSystem.test.js
	@echo "Step 3: Running Functional Test - Village System..."
	@node --test src/rpg-idle/js/engine/tests/engine-functional/VillageSystem.test.js
	@echo "Step 4: Running Functional Test - Infinite Adventure..."
	@node --test src/rpg-idle/js/engine/tests/engine-functional/InfiniteAdventure.test.js
	@echo "Step 5: Running Performance Benchmark..."
	@node --test src/rpg-idle/js/engine/tests/engine-functional/BattleBenchmark.test.js
	@echo "All tests passed!"

# --- Legacy Targets (Isolated) ---
dsi-build:
	@if [ ! -d "src/$(APP)" ]; then echo "Error: App '$(APP)' not found in src/"; exit 1; fi
	@echo "Building APP: $(APP) (legacy mode)..."
	@echo "Installing dependencies..."
	@. $(HOME)/.nvm/nvm.sh && npm install
	
	@echo "Building $(APP) (debug)..."
	@. $(HOME)/.nvm/nvm.sh && APP=$(APP) npm run build:debug
	@cp dist/index.html ./$(APP)_debug.html
	
	@echo "Building $(APP) (production)..."
	@. $(HOME)/.nvm/nvm.sh && APP=$(APP) npm run build:prod
	@cp dist/index.html ./$(APP).html
	@if [ "$(APP)" = "hub" ]; then cp ./hub.html ./index.html; fi
	@if [ -f "src/$(APP)/index_v2.html" ]; then \
		echo "Building $(APP) V2..."; \
		. $(HOME)/.nvm/nvm.sh && APP=$(APP) ENTRY_FILE=index_v2.html npm run build:prod; \
		if [ -f "dist/index_v2.html" ]; then cp dist/index_v2.html ./$(APP)_v2.html; else cp dist/index.html ./$(APP)_v2.html; fi \
	fi
	@echo "Build complete for $(APP)!"

dsi-build-all:
	@for app in $$(ls src/); do \
		if [ -d "src/$$app" ]; then \
			$(MAKE) dsi-build APP=$$app; \
		fi \
	done
	@echo "Successfully built all apps (legacy)!"

# --- Optimized Targets (Agnostic & Clean) ---
build:
	@if [ ! -d "src/$(APP)" ]; then echo "Error: App '$(APP)' not found in src/"; exit 1; fi
	@echo "--- Building APP: $(APP) ---"

	@echo "Building $(APP) (production)..."
	@APP=$(APP) npm run build:prod
	@cp dist/index.html $(STAGING_DIR)/$(APP).html
	@if [ "$(APP)" = "hub" ]; then \
		echo "Deploying hub as index.html..."; \
		cp $(STAGING_DIR)/$(APP).html $(STAGING_DIR)/index.html; \
	fi

	@if [ -f "src/$(APP)/index_v2.html" ]; then \
		echo "Building $(APP) V2..."; \
		APP=$(APP) ENTRY_FILE=index_v2.html npm run build:prod; \
		if [ -f "dist/index_v2.html" ]; then \
			cp dist/index_v2.html $(STAGING_DIR)/$(APP)_v2.html; \
		else \
			cp dist/index.html $(STAGING_DIR)/$(APP)_v2.html; \
		fi \
	fi

build-all:
	@echo "Preparing staging directory: $(STAGING_DIR)"
	@mkdir -p $(STAGING_DIR)
	@echo "Installing dependencies..."
	@npm install
	@for app in $$(ls src/); do \
		if [ -d "src/$$app" ]; then \
			$(MAKE) build APP=$$app STAGING_DIR=$(STAGING_DIR); \
		fi \
	done
	@echo "Successfully built all apps into $(STAGING_DIR)!"
