dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

prod:
	docker-compose up -d --build

down:
	docker-compose down -v