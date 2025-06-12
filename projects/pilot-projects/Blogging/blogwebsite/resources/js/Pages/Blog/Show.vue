<script setup>
import BlogLayout from '@/Layouts/BlogLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import { ref } from 'vue';
import { toast } from 'vue3-toastify';
import { router } from '@inertiajs/vue3';

const props = defineProps({
  post: Object,
  categories: Array,
  comments: Array,
});

const commentForm = ref({
  name: '',
  email: '',
  content: '',
  submitting: false,
});

function submitComment() {
  if (!commentForm.value.name || !commentForm.value.email || !commentForm.value.content) {
    toast.error('All fields are required.');
    return;
  }
  commentForm.value.submitting = true;
  router.post(route('blog.comment', props.post.slug), {
    name: commentForm.value.name,
    email: commentForm.value.email,
    content: commentForm.value.content,
  }, {
    onSuccess: () => {
      toast.success('Comment submitted for moderation!');
      commentForm.value.name = '';
      commentForm.value.email = '';
      commentForm.value.content = '';
    },
    onError: (errors) => {
      Object.values(errors).forEach(msg => toast.error(msg));
    },
    onFinish: () => {
      commentForm.value.submitting = false;
    }
  });
}
</script>

<template>
  <Head :title="post.title" />
  <BlogLayout :categories="categories">
    <div class="mx-auto py-12 px-4 w-full" :style="{ maxWidth: '70vw' }">
      <div class="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
        <!-- Featured Image Placeholder -->
        <div class="h-64 bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
          <img v-if="post.hero_image_url" :src="post.hero_image_url" alt="Post hero image" class="object-cover w-full h-full" />
          <img v-else src="https://placehold.co/800x300?text=Blog+Image" alt="Post thumbnail" class="object-cover w-full h-full" />
        </div>
        <div class="p-8">
          <h1 class="text-4xl font-extrabold mb-4 text-indigo-900 leading-tight">{{ post.title }}</h1>
          <div class="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
            <span>By <span class="font-semibold text-indigo-700">{{ post.user?.name || 'Author' }}</span></span>
            <span v-if="post.published_at">| {{ new Date(post.published_at).toLocaleDateString() }}</span>
            <span v-if="post.category">| <span class="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">{{ post.category.name }}</span></span>
            <span v-for="tag in post.tags" :key="tag.id" class="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold">#{{ tag.name }}</span>
          </div>
          <p v-if="post.excerpt" class="mb-8 text-xl text-indigo-700 italic border-l-4 border-indigo-200 pl-4">{{ post.excerpt }}</p>
          <div class="prose prose-lg max-w-none text-gray-900 mb-10" v-html="post.content"></div>

          <!-- Comment Submission Form -->
          <div class="bg-indigo-50 rounded-xl p-6 mb-10 mt-10">
            <h2 class="text-xl font-bold mb-4 text-indigo-900">Leave a Comment</h2>
            <form @submit.prevent="submitComment" class="space-y-4">
              <div>
                <label class="block font-medium mb-1">Name</label>
                <input v-model="commentForm.name" type="text" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
              <div>
                <label class="block font-medium mb-1">Email</label>
                <input v-model="commentForm.email" type="email" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
              <div>
                <label class="block font-medium mb-1">Comment</label>
                <textarea v-model="commentForm.content" rows="4" class="w-full border border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" required></textarea>
              </div>
              <div>
                <button type="submit" :disabled="commentForm.submitting" class="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-semibold disabled:opacity-50">Submit Comment</button>
              </div>
            </form>
          </div>

          <!-- Approved Comments List -->
          <div class="mt-12">
            <h2 class="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2">
              <svg xmlns='http://www.w3.org/2000/svg' class='h-7 w-7 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l.8-3.2A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'/></svg>
              Comments
            </h2>
            <div v-if="comments.length" class="space-y-6">
              <div v-for="comment in comments" :key="comment.id" class="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex flex-col gap-2">
                <div class="flex items-center gap-3 mb-1">
                  <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-lg">
                    {{ comment.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <span class="font-semibold text-indigo-700">{{ comment.name }}</span>
                    <span class="text-xs text-gray-400 ml-2">{{ new Date(comment.created_at).toLocaleString() }}</span>
                  </div>
                </div>
                <div class="text-gray-700 text-base leading-relaxed pl-2 border-l-4 border-indigo-100">{{ comment.content }}</div>
              </div>
            </div>
            <div v-else class="text-gray-400 italic">No comments yet.</div>
          </div>
        </div>
      </div>
    </div>
  </BlogLayout>
</template> 