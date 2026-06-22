<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class GzipEncoding
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if (app()->isDownForMaintenance()) {
            return $response;
        }

        // Check if gzip extension is loaded and client accepts gzip compression
        if (extension_loaded('zlib') && str_contains($request->header('Accept-Encoding', ''), 'gzip')) {
            // Only compress responses that are not already compressed and are text-based or json
            $contentType = $response->headers->get('Content-Type');
            if ($contentType && (
                str_contains($contentType, 'application/json') ||
                str_contains($contentType, 'text/html') ||
                str_contains($contentType, 'text/plain') ||
                str_contains($contentType, 'application/javascript') ||
                str_contains($contentType, 'text/css')
            )) {
                $content = $response->getContent();
                
                // Compress content
                $compressedContent = gzencode($content, 9);
                
                if ($compressedContent !== false) {
                    $response->setContent($compressedContent);
                    $response->headers->set('Content-Encoding', 'gzip');
                    $response->headers->set('Vary', 'Accept-Encoding');
                    
                    // Update content length if set
                    if ($response->headers->has('Content-Length')) {
                        $response->headers->set('Content-Length', strlen($compressedContent));
                    }
                }
            }
        }

        return $response;
    }
}
