dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

build:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

infra:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d zookeeper kafka kafka-init kafka-ui postgres redis elasticsearch

stop:
	docker-compose stop

down:
	docker-compose down

clean:
	docker-compose down -v

logs:
	docker-compose logs -f $(s)

restart:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build $(s)

# ── Dev DB ────────────────────────────────────────────────────

db-migrate:
	cd shared && npm run migrate

db-seed:
	cd shared && npm run seed

db-setup: db-migrate db-seed

# ── Test DB ───────────────────────────────────────────────────

test-db-up:
	docker-compose -f docker-compose.test.yml up -d

test-db-down:
	docker-compose -f docker-compose.test.yml down

test-db-migrate:
	cd shared && npm run migrate:test

test-db-seed:
	cd shared && npm run seed:test

test-db-setup: test-db-up test-db-migrate test-db-seed
