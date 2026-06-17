.PHONY: migrate-central migrate-tenants run-queue setup

# Run central DB migrations (indexes on platform tables)
migrate-central:
	php artisan migrate --path=database/migrations/2026_06_18_000002_optimize_platform_indexes.php

# Run tenant DB migrations (indexes + unique email fix) on all tenants
migrate-tenants:
	php artisan tenants:migrate --path=database/migrations/2026_06_18_000001_optimize_tenant_indexes.php

# Start queue worker for async tenant provisioning
run-queue:
	php artisan queue:work --queue=default --tries=3 --timeout=120

# Full setup: central migration → tenant migrations → queue worker
setup: migrate-central migrate-tenants
	@echo "Migrations complete. Start the queue worker with: make run-queue"
