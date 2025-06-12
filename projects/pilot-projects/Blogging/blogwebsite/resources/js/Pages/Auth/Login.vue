<script setup>
import Checkbox from '@/Components/Checkbox.vue';
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';

defineProps({
    canResetPassword: Boolean,
    status: String,
});

const form = useForm({
    email: '',
    password: '',
    remember: false,
});

const submit = () => {
    form.post(route('login'), {
        onFinish: () => form.reset('password'),
    });
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div class="flex flex-col items-center mb-8">
                <div class="text-3xl font-extrabold text-indigo-700 mb-2 tracking-tight">MyBlog</div>
                <div class="text-gray-400 text-sm">Sign in to your account</div>
            </div>
            <form @submit.prevent="submit" class="space-y-6">
                <div>
                    <InputLabel for="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        class="mt-1 block w-full rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 text-base"
                        v-model="form.email"
                        required
                        autofocus
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
                        autocomplete="current-password"
                    />
                    <InputError class="mt-2" :message="form.errors.password" />
                </div>
                <div class="flex items-center justify-between">
                    <label class="flex items-center">
                        <Checkbox name="remember" v-model:checked="form.remember" />
                        <span class="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <Link
                        v-if="canResetPassword"
                        :href="route('password.request')"
                        class="text-sm text-indigo-600 hover:underline font-semibold"
                    >
                        Forgot password?
                    </Link>
                </div>
                <PrimaryButton class="w-full py-3 text-lg rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-bold" :class="{ 'opacity-25': form.processing }" :disabled="form.processing">
                    Log in
                </PrimaryButton>
            </form>
        </div>
    </div>
</template>
