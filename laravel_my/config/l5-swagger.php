<?php

return [
    'default' => 'default',
    'paths' => [
        'annotations' => [
            base_path('routes'),
            base_path('app/Http/Controllers'),
        ],
        'docs' => 'storage/api-docs',
        'views' => base_path('resources/views/vendor/l5-swagger'),
        'route' => '/api/documentation',
        'format' => 'json',
        'excludes' => [],
    ],
    'securitySchemes' => [
        'Bearer' => [
            'type' => 'apiKey',
            'description' => 'Enter token with Bearer: __ to authorize',
            'name' => 'Authorization',
            'in' => 'header',
        ],
    ],
    'servers' => null,
    'constants' => [
        'L5_SWAGGER_CONST_HOST' => env('L5_SWAGGER_CONST_HOST', ''),
    ],
    'documentations' => [
        'default' => [
            'api' => [
                'title' => 'My API',
                'description' => 'This is my API documentation',
                'version' => '1.0.0',
            ],
            'routes' => [
                [
                    'url' => '/api/documentation/json',
                    'docs' => true,
                    'method' => 'get',
                ],
            ],
            'paths' => [
                base_path('routes/api.php'),
                base_path('app/Http/Controllers'),
            ],
            'scanOptions' => [
                'default_unmarked_path_method_operation' => null,
                'default_models_namespace' => 'App\\Models',
            ],
        ],
    ],
    'models' => [
        'pagination' => 'Illuminate\Pagination\Paginator',
    ],
    'security' => [
        [
            'bearer' => [],
        ],
    ],
];
