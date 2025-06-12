<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <nav class="bg-white shadow sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center gap-6">
            <a href="/blog" class="text-2xl font-bold text-indigo-700 tracking-tight">MyBlog</a>
            <div class="flex gap-4">
              <template v-for="cat in categories" :key="cat.id">
                <a :href="route('blog.category', cat.slug)"
                   :class="['px-3 py-2 rounded transition', activeCategory && activeCategory.id === cat.id ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-indigo-50']">
                  {{ cat.name }}
                </a>
              </template>
            </div>
          </div>
          <form @submit.prevent="searchByTag" class="flex items-center gap-2">
            <input v-model="searchTag" type="text" placeholder="Search by tag..." class="border rounded px-3 py-1 focus:ring-indigo-500 focus:border-indigo-500" />
            <button type="submit" class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">Search</button>
          </form>
        </div>
      </div>
    </nav>
    <main class="flex-1">
      <slot />
    </main>
    <footer class="bg-white border-t mt-8 py-6 text-center text-gray-400 text-sm">
      &copy; {{ new Date().getFullYear() }} MyBlog. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { router, usePage } from '@inertiajs/vue3';
import { toast } from 'vue3-toastify';

const props = defineProps({
  categories: { type: Array, default: () => [] },
  activeCategory: { type: Object, default: null },
});

const searchTag = ref('');
const page = usePage();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/&/g, '-and-')          // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/--+/g, '-')            // Replace multiple - with single -
    .replace(/^-+/, '')              // Trim - from start of text
    .replace(/-+$/, '');             // Trim - from end of text
}

function searchByTag() {
  if (searchTag.value.trim()) {
    const slug = slugify(searchTag.value.trim());
    router.visit(route('blog.tag', slug));
    searchTag.value = '';
  }
}

onMounted(() => {
  if (page.props.flash && page.props.flash.error) {
    toast.error(page.props.flash.error);
  }
});
</script> 