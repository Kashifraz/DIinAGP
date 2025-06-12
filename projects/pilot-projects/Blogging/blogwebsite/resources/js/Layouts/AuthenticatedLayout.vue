<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Dropdown from '@/Components/Dropdown.vue';
import DropdownLink from '@/Components/DropdownLink.vue';
import NavLink from '@/Components/NavLink.vue';
import { Link } from '@inertiajs/vue3';

const showSideNav = ref(false);
const isDesktop = ref(window.innerWidth >= 1024); // lg breakpoint

function handleResize() {
  isDesktop.value = window.innerWidth >= 1024;
  if (isDesktop.value) showSideNav.value = false;
}
onMounted(() => {
  window.addEventListener('resize', handleResize);
  handleResize();
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Top Nav Bar -->
    <nav class="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-30 shadow-sm">
      <div class="flex items-center gap-4">
        <button v-if="!isDesktop" @click="showSideNav = true" class="p-2 rounded hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <Link :href="route('dashboard')" class="text-2xl font-extrabold text-indigo-700 tracking-tight">MyBlog</Link>
      </div>
      <div class="flex items-center">
        <div class="ml-3 relative">
          <Dropdown align="right" width="48">
            <template #trigger>
              <span class="inline-flex rounded-md">
                <button type="button" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition">
                  {{ $page.props.auth.user.name }}
                  <svg class="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                </button>
              </span>
            </template>
            <template #content>
              <DropdownLink :href="route('profile.edit')">Profile</DropdownLink>
              <DropdownLink :href="route('logout')" method="post" as="button">Log Out</DropdownLink>
            </template>
          </Dropdown>
        </div>
      </div>
    </nav>

    <!-- Layout grid: side nav + main -->
    <div class="pt-16 flex">
      <!-- Side Nav (desktop) -->
      <aside v-if="isDesktop" class="w-56 min-h-screen bg-white border-r border-gray-100 shadow-sm flex flex-col py-8 px-6 fixed top-16 left-0 z-20">
        <nav class="flex flex-col gap-2">
          <NavLink :href="route('dashboard')" :active="route().current('dashboard')" class="side-nav-link">Dashboard</NavLink>
          <NavLink :href="route('posts.index')" :active="route().current('posts.index')" class="side-nav-link">My Posts</NavLink>
          <NavLink :href="route('categories.index')" :active="route().current('categories.index')" class="side-nav-link">Categories</NavLink>
          <NavLink :href="route('comments.moderation')" :active="route().current('comments.moderation')" class="side-nav-link">Comment Moderation</NavLink>
        </nav>
      </aside>
      <!-- Side Nav (mobile, overlay) -->
      <transition name="slide">
        <div v-if="showSideNav && !isDesktop" class="fixed inset-0 z-40 flex">
          <div class="fixed inset-0 bg-black bg-opacity-30" @click="showSideNav = false"></div>
          <aside class="relative w-56 min-h-screen bg-white border-r border-gray-100 shadow-lg flex flex-col py-8 px-6 z-50">
            <button @click="showSideNav = false" class="absolute top-4 right-4 p-2 rounded hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-200">
              <svg class="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <nav class="flex flex-col gap-2 mt-4">
              <NavLink :href="route('dashboard')" :active="route().current('dashboard')" class="side-nav-link">Dashboard</NavLink>
              <NavLink :href="route('posts.index')" :active="route().current('posts.index')" class="side-nav-link">My Posts</NavLink>
              <NavLink :href="route('categories.index')" :active="route().current('categories.index')" class="side-nav-link">Categories</NavLink>
              <NavLink :href="route('comments.moderation')" :active="route().current('comments.moderation')" class="side-nav-link">Comment Moderation</NavLink>
            </nav>
          </aside>
        </div>
      </transition>
      <!-- Main Content -->
      <div :class="[isDesktop ? 'ml-56' : 'w-full', 'flex-1 flex flex-col transition-all']">
        <header class="bg-white shadow" v-if="$slots.header">
          <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <slot name="header" />
          </div>
        </header>
        <main>
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: transform 0.2s;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}
.side-nav-link {
  display: block;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 500;
  color: #4B5563;
  transition: background 0.15s, color 0.15s;
}
.side-nav-link:hover, .side-nav-link:focus {
  background: #EEF2FF;
  color: #3730A3;
}
.side-nav-link[aria-current="page"], .side-nav-link.active {
  background: #6366F1;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 2px 8px 0 rgba(99,102,241,0.08);
}
</style>
