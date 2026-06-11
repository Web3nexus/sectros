<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WebsiteTemplate;
use App\Models\TenantTheme;
use App\Services\PaymentService;

class PublicThemeController extends Controller
{
    /**
     * List all available themes for the tenant.
     * Includes information about whether the theme is unlocked.
     */
    public function index()
    {
        try {
            $tenant = tenant();
            
            // Themes in central DB - only active ones
            $templates = tenancy()->central(fn() => WebsiteTemplate::where('is_active', true)->get());
            
            // Purchased themes in central DB
            $purchasedIds = tenancy()->central(fn() => 
                TenantTheme::where('tenant_id', $tenant->id)->pluck('website_template_id')->toArray()
            );

            $data = $templates->map(function($tpl) use ($tenant, $purchasedIds) {
                $isUnlocked = $tpl->is_free ||
                              in_array($tpl->id, $purchasedIds) || 
                              ($tpl->required_plan_id && $this->isPlanHighEnough($tenant->plan, $tpl->required_plan_id));
                
                return [
                    'id' => $tpl->id,
                    'name' => $tpl->name,
                    'slug' => $tpl->slug,
                    'category' => $tpl->category,
                    'preview_image_url' => $tpl->preview_image_url,
                    'price' => $tpl->price,
                    'is_free' => $tpl->is_free,
                    'required_plan_id' => $tpl->required_plan_id,
                    'is_unlocked' => $isUnlocked,
                    'sections_json' => $tpl->sections_json,
                    'theme_json' => $tpl->theme_json
                ];
            })->toArray();
                
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'trace' => APP_DEBUG ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    /**
     * Get the content of a specific template if unlocked.
     */
    public function show($id)
    {
        $tenant = tenant();
        $template = tenancy()->central(fn() => WebsiteTemplate::findOrFail($id));

        $purchased = tenancy()->central(fn() => 
            TenantTheme::where('tenant_id', $tenant->id)->where('website_template_id', $id)->exists()
        );

        $isUnlocked = $template->is_free || $purchased || ($template->required_plan_id && $this->isPlanHighEnough($tenant->plan, $template->required_plan_id));

        if (!$isUnlocked) {
            return response()->json(['message' => 'Theme is locked. Please purchase to use.'], 403);
        }

        return response()->json($template);
    }

    /**
     * Initialize a purchase session for a premium theme.
     */
    public function purchase(Request $request, $id, PaymentService $paymentService)
    {
        $tenant = tenant();
        $template = tenancy()->central(fn() => WebsiteTemplate::findOrFail($id));

        if ($template->is_free) {
            TenantTheme::updateOrCreate(
                ['tenant_id' => $tenant->id, 'website_template_id' => $template->id],
                ['purchased_at' => now(), 'price_paid' => 0.00]
            );
            return response()->json(['unlocked' => true, 'message' => 'Theme unlocked successfully!']);
        }

        try {
            $paymentInfo = $paymentService->initializeThemePurchase($tenant, $template);
            return response()->json($paymentInfo);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    private function isPlanHighEnough($currentPlanSlug, $requiredPlanId)
    {
        // Simple comparison for now. Ideally, this would check a 'weight' or 'rank' column in subscription_plans.
        // For this system, we can just assume if the ID is matched or higher it works, 
        // OR fetch the central plan weights.
        
        return tenancy()->central(fn() => 
            \App\Models\SubscriptionPlan::where('slug', $currentPlanSlug)->where('id', '>=', $requiredPlanId)->exists()
        );
    }
}
