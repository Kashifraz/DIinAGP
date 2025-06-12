<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import DangerButton from '@/Components/DangerButton.vue';
import Modal from '@/Components/Modal.vue';
import { Head, usePage, router } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({ categories: Object });

const showDeleteModal = ref(false);
const categoryToDelete = ref(null);

function confirmDelete(category) {
    categoryToDelete.value = category;
    showDeleteModal.value = true;
}
function destroy() {
    if (categoryToDelete.value) {
        router.delete(route('categories.destroy', categoryToDelete.value.id), {
            onFinish: () => {
                showDeleteModal.value = false;
                categoryToDelete.value = null;
            },
        });
    }
}
</script>
<template>
    <Head title="Categories" />
    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Categories</h2>
        </template>
        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div class="mb-4 flex justify-end">
                    <PrimaryButton @click="$inertia.visit(route('categories.create'))">New Category</PrimaryButton>
                </div>
                <table class="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Slug</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(category, idx) in categories.data" :key="category.id" :class="[idx % 2 === 0 ? 'bg-white' : 'bg-gray-50', 'hover:bg-indigo-50 transition']">
                            <td class="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{{ category.name }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-gray-700">{{ category.slug }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-gray-500">{{ category.description }}</td>
                            <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                                <PrimaryButton type="button" @click="$inertia.visit(route('categories.edit', category.id))">Edit</PrimaryButton>
                                <DangerButton type="button" @click="confirmDelete(category)">Delete</DangerButton>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="categories.links && categories.links.length > 1" class="mt-8 flex justify-center gap-2">
                  <button v-for="link in categories.links" :key="link.label" :disabled="!link.url" @click="$inertia.visit(link.url)" v-html="link.label" :class="['px-3 py-1 rounded', link.active ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700 hover:bg-indigo-50', !link.url ? 'opacity-50 cursor-not-allowed' : '']" />
                </div>
            </div>
        </div>
        <Modal :show="showDeleteModal" @close="showDeleteModal = false">
            <div class="p-6">
                <h2 class="text-lg font-semibold mb-4">Confirm Deletion</h2>
                <p class="mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>
                <div class="flex justify-end gap-2">
                    <PrimaryButton type="button" @click="showDeleteModal = false">Cancel</PrimaryButton>
                    <DangerButton type="button" @click="destroy">Delete</DangerButton>
                </div>
            </div>
        </Modal>
    </AuthenticatedLayout>
</template> 