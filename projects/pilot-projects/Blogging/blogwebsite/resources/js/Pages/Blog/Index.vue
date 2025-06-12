<script setup>
import BlogLayout from '@/Layouts/BlogLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import { onMounted } from 'vue';
import { toast } from 'vue3-toastify';

const props = defineProps({
  posts: Object,
  categories: Array,
  tags: Array,
  activeCategory: Object,
  activeTag: Object,
  noPosts: Boolean,
});

onMounted(() => {
  if (props.noPosts && props.activeTag) {
    toast.error(`No posts found for tag: ${props.activeTag.name}`);
  }
});
</script>
<template>
  <Head title="Blog" />
  <BlogLayout :categories="categories" :activeCategory="activeCategory">
    <div class="max-w-5xl mx-auto py-10 px-4">
      <div class="mb-8 flex flex-wrap gap-2 items-center">
        <span v-if="activeCategory" class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">Category: {{ activeCategory.name }}</span>
        <span v-if="activeTag" class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Tag: {{ activeTag.name }}</span>
      </div>
      <div v-if="noPosts && activeTag" class="text-center text-lg text-gray-500 py-12">
        No posts found for tag: <span class="font-semibold">{{ activeTag.name }}</span>
      </div>
      <div v-else class="grid md:grid-cols-2 gap-8 md:gap-x-12 md:gap-y-16 py-2">
        <div v-for="post in posts.data" :key="post.id" class="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col">
          <div class="h-48 bg-gray-200 flex items-center justify-center">
            <img v-if="post.hero_image_url" :src="post.hero_image_url" alt="Post hero image" class="object-cover w-full h-full" />
            <img v-else src="https://placehold.co/400x200?text=Blog+Image" alt="Post thumbnail" class="object-cover w-full h-full" />
          </div>
          <div class="p-6 flex-1 flex flex-col">
            <div class="flex gap-2 mb-2">
              <span v-if="post.category" class="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">{{ post.category.name }}</span>
              <span v-for="tag in post.tags" :key="tag.id" class="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">{{ tag.name }}</span>
            </div>
            <h2 class="text-xl font-bold mb-2 text-gray-900">
              <Link :href="route('blog.show', post.slug)" class="hover:underline hover:text-indigo-700 transition">
                {{ post.title }}
              </Link>
            </h2>
            <p class="text-gray-600 mb-4 line-clamp-3">{{ post.excerpt }}</p>
            <div class="mt-auto flex justify-between items-end">
              <span class="text-xs text-gray-400">By {{ post.user?.name || 'Author' }} &middot; {{ new Date(post.published_at).toLocaleDateString() }}</span>
              <Link :href="route('blog.show', post.slug)" class="ml-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm font-semibold">Read More</Link>
            </div>
          </div>
        </div>
      </div>
      <div v-if="posts.links && posts.links.length > 1" class="mt-10 flex justify-center gap-2">
        <button v-for="link in posts.links" :key="link.label" :disabled="!link.url" @click="$inertia.visit(link.url)" v-html="link.label" :class="['px-3 py-1 rounded', link.active ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700 hover:bg-indigo-50', !link.url ? 'opacity-50 cursor-not-allowed' : '']" />
      </div>
    </div>
  </BlogLayout>
</template> 