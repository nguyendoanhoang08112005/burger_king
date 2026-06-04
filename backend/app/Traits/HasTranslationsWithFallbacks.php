<?php

namespace App\Traits;

use Spatie\Translatable\HasTranslations;

trait HasTranslationsWithFallbacks
{
    use HasTranslations;

    public function toArray()
    {
        $attributes = parent::toArray();

        if (!app()->runningInConsole() && !request()->is('api/admin/*') && !request()->is('admin/*')) {
            foreach ($this->getTranslatableAttributes() as $field) {
                if (array_key_exists($field, $attributes)) {
                    $attributes[$field] = $this->getTranslation($field, app()->getLocale());
                }
            }
        }

        return $attributes;
    }
}
