<script setup>
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';

const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    terms: false,
});

const submit = () => {
    form.post(route('register'), {
        onFinish: () => form.reset('password', 'password_confirmation'),
    });
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div class="flex flex-col items-center mb-8">
                <div class="text-3xl font-extrabold text-indigo-700 mb-2 tracking-tight">MyBlog</div>
                <div class="text-gray-400 text-sm">Create your account</div>
            </div>
            <form @submit.prevent="submit" class="space-y-6">
                <div>
                    <InputLabel for="name" value="Name" />
                    <TextInput
                        id="name"
                        type="text"
                        class="mt-1 block w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 text-base"
                        v-model="form.name"
                        required
                        autofocus
                        autocomplete="name"
                    />
                    <InputError class="mt-2" :message="form.errors.name" />
                </div>
                <div>
                    <InputLabel for="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        class="mt-1 block w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 text-base"
                        v-model="form.email"
                        required
                        autocomplete="username"
                    />
                    <InputError class="mt-2" :message="form.errors.email" />
                </div>
                <div>
                    <InputLabel for="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        class="mt-1 block w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 text-base"
                        v-model="form.password"
                        required
                        autocomplete="new-password"
                    />
                    <InputError class="mt-2" :message="form.errors.password" />
                </div>
                <div>
                    <InputLabel for="password_confirmation" value="Confirm Password" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        class="mt-1 block w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 text-base"
                        v-model="form.password_confirmation"
                        required
                        autocomplete="new-password"
                    />
                    <InputError class="mt-2" :message="form.errors.password_confirmation" />
                </div>
                <div class="flex items-center justify-end">
                    <Link
                        :href="route('login')"
                        class="text-sm text-indigo-600 hover:underline font-semibold"
                    >
                        Already registered?
                    </Link>
                </div>
                <PrimaryButton class="w-full py-3 text-lg rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-bold" :class="{ 'opacity-25': form.processing }" :disabled="form.processing">
                    Register
                </PrimaryButton>
            </form>
        </div>
    </div>
</template>
