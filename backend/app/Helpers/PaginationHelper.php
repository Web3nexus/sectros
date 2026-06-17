<?php

namespace App\Helpers;

use Illuminate\Http\Request;

class PaginationHelper
{
    const MAX_PER_PAGE = 50;
    const DEFAULT_PER_PAGE = 20;

    public static function normalize(Request $request, int $max = self::MAX_PER_PAGE, int $default = self::DEFAULT_PER_PAGE): array
    {
        $perPage = (int) $request->query('per_page', $default);
        $perPage = min(max($perPage, 1), $max);

        $page = (int) $request->query('page', 1);
        $page = max($page, 1);

        return [
            'per_page' => $perPage,
            'page' => $page,
            'offset' => ($page - 1) * $perPage,
        ];
    }

    public static function toMeta(int $total, int $perPage, int $page): array
    {
        $total = max(0, $total);
        return [
            'current_page' => $page,
            'last_page' => max(1, (int) ceil($total / $perPage)),
            'per_page' => $perPage,
            'total' => $total,
        ];
    }

    public static function applyToQuery($query, Request $request, int $max = self::MAX_PER_PAGE, int $default = self::DEFAULT_PER_PAGE)
    {
        $params = self::normalize($request, $max, $default);
        return $query->limit($params['per_page'])->offset($params['offset']);
    }
}
