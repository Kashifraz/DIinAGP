<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';
const props = defineProps({ stats: Object });
</script>

<template>
    <Head title="Dashboard" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-2xl text-indigo-900 leading-tight">Dashboard</h2>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <div class="text-4xl font-extrabold text-indigo-700 mb-2">{{ stats.totalPosts }}</div>
                        <div class="text-gray-500 font-semibold">Total Posts</div>
                        <div class="flex gap-4 mt-4">
                            <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">Draft: {{ stats.draftPosts }}</span>
                            <span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">Published: {{ stats.publishedPosts }}</span>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <div class="text-4xl font-extrabold text-indigo-700 mb-2">{{ stats.totalCategories }}</div>
                        <div class="text-gray-500 font-semibold">Categories</div>
                        <div class="w-full mt-4">
                            <div v-for="cat in stats.categories" :key="cat.id" class="flex justify-between text-xs py-1 border-b last:border-b-0">
                                <span class="font-medium text-gray-700">{{ cat.name }}</span>
                                <span class="text-indigo-600 font-bold">{{ cat.posts_count }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <div class="text-4xl font-extrabold text-indigo-700 mb-2">{{ stats.totalComments }}</div>
                        <div class="text-gray-500 font-semibold">Comments</div>
                        <div class="flex gap-4 mt-4">
                            <span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">Approved: {{ stats.approvedComments }}</span>
                            <span class="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">Pending: {{ stats.pendingComments }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
