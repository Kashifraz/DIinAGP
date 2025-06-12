<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { toast } from 'vue3-toastify';

const props = defineProps({ category: Object });

const form = useForm({
    name: props.category.name,
    slug: props.category.slug,
    description: props.category.description,
});

function submit() {
    form.put(route('categories.update', props.category.id), {
        onError: (errors) => {
            Object.values(errors).forEach(msg => toast.error(msg));
        },
    });
}
</script>
<template>
    <Head title="Edit Category" />
    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Edit Category</h2>
        </template>
        <div class="py-12">
            <div class="max-w-xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white shadow-lg rounded-lg p-8">
                    <form @submit.prevent="submit" class="space-y-6">
                        <div>
                            <label class="block font-medium">Name</label>
                            <input v-model="form.name" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition" required />
                        </div>
                        <div>
                            <label class="block font-medium">Slug</label>
                            <input v-model="form.slug" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="Auto-generated if left blank" />
                        </div>
                        <div>
                            <label class="block font-medium">Description</label>
                            <textarea v-model="form.description" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"></textarea>
                        </div>
                        <div>
                            <PrimaryButton type="submit">Save</PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template> 