<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, usePage, useForm } from '@inertiajs/vue3';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import DangerButton from '@/Components/DangerButton.vue';
import Modal from '@/Components/Modal.vue';
import { ref } from 'vue';

defineProps({ posts: Object });

const form = useForm({});
const showDeleteModal = ref(false);
const postToDelete = ref(null);

function confirmDelete(post) {
    postToDelete.value = post;
    showDeleteModal.value = true;
}

function destroy() {
    if (postToDelete.value) {
        form.delete(route('posts.destroy', postToDelete.value.id), {
            onFinish: () => {
                showDeleteModal.value = false;
                postToDelete.value = null;
            },
        });
    }
}
</script>

<template>
    <Head title="My Posts" />
    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">My Posts</h2>
        </template>
        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div class="mb-4 flex justify-end">
                    <PrimaryButton @click="$inertia.visit(route('posts.create'))">New Post</PrimaryButton>
                </div>
                <table class="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(post, idx) in posts.data" :key="post.id" :class="[idx % 2 === 0 ? 'bg-white' : 'bg-gray-50', 'hover:bg-indigo-50 transition']">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <img v-if="post.hero_image_url" :src="post.hero_image_url" alt="Hero" class="w-12 h-12 object-cover rounded shadow border" />
                                <img v-else src="https://placehold.co/48x48?text=No+Image" alt="No Hero" class="w-12 h-12 object-cover rounded shadow border" />
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{{ post.title }}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span :class="post.status === 'published' ? 'text-green-600 font-bold' : 'text-gray-500'">{{ post.status }}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                                <PrimaryButton type="button" @click="$inertia.visit(route('posts.edit', post.id))">Edit</PrimaryButton>
                                <PrimaryButton type="button" @click="$inertia.visit(route('posts.show', post.id))">Preview</PrimaryButton>
                                <DangerButton type="button" @click="confirmDelete(post)">Delete</DangerButton>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="posts.links && posts.links.length > 1" class="mt-8 flex justify-center gap-2">
                  <button v-for="link in posts.links" :key="link.label" :disabled="!link.url" @click="$inertia.visit(link.url)" v-html="link.label" :class="['px-3 py-1 rounded', link.active ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700 hover:bg-indigo-50', !link.url ? 'opacity-50 cursor-not-allowed' : '']" />
                </div>
            </div>
        </div>
        <Modal :show="showDeleteModal" @close="showDeleteModal = false">
            <div class="p-6">
                <h2 class="text-lg font-semibold mb-4">Confirm Deletion</h2>
                <p class="mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
                <div class="flex justify-end gap-2">
                    <PrimaryButton type="button" @click="showDeleteModal = false">Cancel</PrimaryButton>
                    <DangerButton type="button" @click="destroy">Delete</DangerButton>
                </div>
            </div>
        </Modal>
    </AuthenticatedLayout>
</template> 