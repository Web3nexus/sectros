<?php

namespace App\Http\Middleware;

use App\Services\TenantResolver;
use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantThrottle
{
    protected RateLimiter $limiter;

    public function __construct(RateLimiter $limiter)
    {
        $this->limiter = $limiter;
    }

    public function handle(Request $request, Closure $next, int $maxAttempts = 120, int $decayMinutes = 1): Response
    {
        $tenant = TenantResolver::resolve();

        $key = 'tenant-throttle:' . ($tenant?->getTenantKey() ?? 'global') . '|' . $request->getClientIp();

        if ($this->limiter->tooManyAttempts($key, $maxAttempts)) {
            $retryAfter = $this->limiter->availableIn($key);
            return response()->json([
                'message' => 'Too many requests. Please try again in ' . $retryAfter . ' seconds.',
                'retry_after' => $retryAfter,
            ], 429);
        }

        $this->limiter->hit($key, $decayMinutes * 60);

        $response = $next($request);

        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', max(0, $maxAttempts - $this->limiter->attempts($key)));

        return $response;
    }
}
