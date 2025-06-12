<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import DangerButton from '@/Components/DangerButton.vue';
import Modal from '@/Components/Modal.vue';
import { Head, usePage } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({ tags: Object });

const showDeleteModal = ref(false);
const tagToDelete = ref(null);

function confirmDelete(tag) {
    tagToDelete.value = tag;
    showDeleteModal.value = true;
}
function destroy() {
    // Implement delete logic with Inertia
    showDeleteModal.value = false;
    tagToDelete.value = null;
}
</script>
<template>
    <Head title="Tags" />
    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Tags</h2>
        </template>
        <div class="py-12">
            <div class="max-w-5xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white shadow-lg rounded-lg p-8">
                    <div class="mb-4 flex justify-end">
                        <PrimaryButton @click="$inertia.visit(route('tags.create'))">New Tag</PrimaryButton>
                    </div>
                    <table class="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Slug</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(tag, idx) in tags.data" :key="tag.id" :class="[idx % 2 === 0 ? 'bg-white' : 'bg-gray-50', 'hover:bg-indigo-50 transition']">
                                <td class="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{{ tag.name }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-gray-700">{{ tag.slug }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-gray-500">{{ tag.description }}</td>
                                <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                                    <PrimaryButton type="button" @click="$inertia.visit(route('tags.edit', tag.id))">Edit</PrimaryButton>
                                    <DangerButton type="button" @click="confirmDelete(tag)">Delete</DangerButton>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <Modal :show="showDeleteModal" @close="showDeleteModal = false">
            <div class="p-6">
                <h2 class="text-lg font-semibold mb-4">Confirm Deletion</h2>
                <p class="mb-6">Are you sure you want to delete this tag? This action cannot be undone.</p>
                <div class="flex justify-end gap-2">
                    <PrimaryButton type="button" @click="showDeleteModal = false">Cancel</PrimaryButton>
                    <DangerButton type="button" @click="destroy">Delete</DangerButton>
                </div>
            </div>
        </Modal>
    </AuthenticatedLayout>
</template> 