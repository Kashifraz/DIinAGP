<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div class="text-6xl font-bold text-indigo-600 mb-4">404</div>
    <div class="text-2xl font-semibold text-gray-800 mb-2">No posts found for this tag</div>
    <div class="text-gray-500 mb-6">Sorry, we couldn't find any posts for the tag you searched for.</div>
    <a href="/blog" class="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-semibold">Back to Blog Home</a>
  </div>
</template>

<script setup>
import { Head } from '@inertiajs/vue3';
</script> 