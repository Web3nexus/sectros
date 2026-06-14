<?php

namespace Tests\Unit;

use App\Models\Tenant;
use App\Models\User;
use App\Scopes\TenantScope;
use App\Services\TenantResolver;
use App\Traits\BelongsToTenant;
use Tests\TestCase;

class TenantScopeTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        TenantResolver::clear();
    }

    public function test_tenant_resolver_returns_null_when_no_context()
    {
        $this->assertNull(TenantResolver::resolve());
    }

    public function test_tenant_resolver_throws_when_no_context()
    {
        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        TenantResolver::resolveOrFail();
    }

    public function test_tenant_resolver_can_be_set_and_cleared()
    {
        $tenant = new Tenant(['id' => 'test-tenant']);
        TenantResolver::set($tenant);
        $this->assertSame($tenant, TenantResolver::resolve());

        TenantResolver::clear();
        $this->assertNull(TenantResolver::resolve());
    }

    public function test_tenant_resolver_id_method()
    {
        $this->assertNull(TenantResolver::id());

        TenantResolver::set(new Tenant(['id' => 'tenant-42']));
        $this->assertEquals('tenant-42', TenantResolver::id());
    }

    public function test_belongs_to_tenant_trait_is_applied()
    {
        $traits = class_uses(User::class);
        $this->assertContains(BelongsToTenant::class, $traits);
    }

    public function test_tenant_scope_is_registered()
    {
        $scopes = (new User())->getGlobalScopes();
        $this->assertArrayHasKey(TenantScope::class, $scopes);
        $this->assertInstanceOf(TenantScope::class, $scopes[TenantScope::class]);
    }

    public function test_model_connections()
    {
        $tenantRef = new \ReflectionProperty(Tenant::class, 'connection');
        $tenantRef->setAccessible(true);
        $this->assertEquals('platform', $tenantRef->getValue(new Tenant()));

        $userRef = new \ReflectionProperty(User::class, 'connection');
        $userRef->setAccessible(true);
        $this->assertEquals('tenant', $userRef->getValue(new User()));
    }

    public function test_tenant_resolver_is_resolved_flag()
    {
        $this->assertFalse(TenantResolver::isResolved());
        TenantResolver::set(new Tenant(['id' => 't']));
        $this->assertTrue(TenantResolver::isResolved());
    }

    public function test_tenant_scope_adds_where_clause()
    {
        $scope = new TenantScope();
        $model = new User();
        $builder = $model->newQuery();

        TenantResolver::set(new Tenant(['id' => 'tenant-a']));
        $scope->apply($builder, $model);

        $wheres = $builder->getQuery()->wheres;
        $this->assertCount(1, $wheres);
        $this->assertEquals('users.tenant_id', $wheres[0]['column']);
        $this->assertEquals('tenant-a', $wheres[0]['value']);
    }

    public function test_tenant_scope_noop_when_no_tenant()
    {
        $scope = new TenantScope();
        $model = new User();
        $builder = $model->newQuery();

        TenantResolver::clear();
        $scope->apply($builder, $model);

        $this->assertEmpty($builder->getQuery()->wheres);
    }

    public function test_tenant_resolver_storage_path()
    {
        $this->assertStringContainsString('storage', TenantResolver::storagePath());

        TenantResolver::set(new Tenant(['id' => 't1']));
        $path = TenantResolver::storagePath('uploads/images');
        $this->assertStringContainsString('tenants/t1/uploads/images', $path);
    }
}
