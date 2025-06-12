<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';
defineProps({ post: Object });
</script>

<template>
    <Head :title="post.title" />
    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Preview Post</h2>
        </template>
        <div class="py-12 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
            <div class="mx-auto" style="width: 70%;">
                <div class="bg-white shadow-2xl rounded-2xl p-12 border border-gray-100">
                    <h1 class="text-4xl font-extrabold mb-4 text-indigo-900 leading-tight">{{ post.title }}</h1>
                    <div class="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
                        <span class="inline-flex items-center"><span class="w-2 h-2 rounded-full mr-2" :class="post.status === 'published' ? 'bg-green-500' : 'bg-gray-400'"></span>Status: <span :class="post.status === 'published' ? 'text-green-600 font-bold ml-1' : 'text-gray-500 ml-1'">{{ post.status }}</span></span>
                        <span v-if="post.published_at">| Published: <span class="font-medium text-gray-700">{{ post.published_at }}</span></span>
                    </div>
                    <p v-if="post.excerpt" class="mb-8 text-xl text-indigo-700 italic border-l-4 border-indigo-200 pl-4">{{ post.excerpt }}</p>
                    <div class="prose prose-lg max-w-none text-gray-900" v-html="post.content"></div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template> 