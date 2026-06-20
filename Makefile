format:
	ruff format app

lint:
	ruff check app

fix:
	ruff check app --fix

test:
	pytest app/tests

cov:
	pytest --cov=app

typecheck:
	mypy app

check:
	ruff check app && mypy app && pytest app/tests
	
up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

backend:
	docker compose exec app bash