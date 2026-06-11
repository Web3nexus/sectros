{{ $subject }}
========================================

{!! strip_tags(str_replace(['<br>', '<br/>', '</p>'], "\n", $content)) !!}

----------------------------------------
© {{ date('Y') }} {{ $platform_name }}. All rights reserved.
