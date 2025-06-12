<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import { toast } from 'vue3-toastify';

const props = defineProps({ comments: Object });
const selected = ref([]);

const allSelected = computed({
  get() {
    return props.comments.data.length > 0 && selected.value.length === props.comments.data.length;
  },
  set(val) {
    if (val) {
      selected.value = props.comments.data.map(c => c.id);
    } else {
      selected.value = [];
    }
  }
});

function toggleSelect(id) {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter(sid => sid !== id);
  } else {
    selected.value.push(id);
  }
}

function bulkAction(action) {
  if (!selected.value.length) {
    toast.error('No comments selected.');
    return;
  }
  router.post(route('comments.bulkAction'), {
    ids: selected.value,
    action,
  }, {
    onSuccess: () => {
      toast.success(`Comments ${action}d successfully!`);
      selected.value = [];
    },
    onError: (errors) => {
      Object.values(errors).forEach(msg => toast.error(msg));
    }
  });
}
</script>
<template>
  <Head title="Comment Moderation" />
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">Comment Moderation</h2>
    </template>
    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="mb-4 flex gap-4 justify-end">
          <button @click="bulkAction('approve')" class="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition font-semibold disabled:opacity-50" :disabled="!selected.length">
            Approve
          </button>
          <button @click="bulkAction('delete')" class="px-5 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition font-semibold disabled:opacity-50" :disabled="!selected.length">
            Delete
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"><input type="checkbox" v-model="allSelected" /></th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Comment</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Post</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(comment, idx) in comments.data" :key="comment.id" :class="[idx % 2 === 0 ? 'bg-white' : 'bg-gray-50', 'hover:bg-indigo-50 transition']">
                <td class="px-4 py-3 text-center"><input type="checkbox" :value="comment.id" v-model="selected" @click.stop /></td>
                <td class="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">{{ comment.name }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-gray-700">{{ comment.email }}</td>
                <td class="px-4 py-3 max-w-xs truncate text-gray-700" :title="comment.content">{{ comment.content }}</td>
                <td class="px-4 py-3">
                  <span v-if="comment.status === 'pending'" class="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Pending</span>
                  <span v-else-if="comment.status === 'approved'" class="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Approved</span>
                  <span v-else class="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">Rejected</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <Link :href="route('blog.show', comment.post.slug)" class="text-indigo-600 hover:underline font-semibold">{{ comment.post.title }}</Link>
                </td>
                <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{{ new Date(comment.created_at).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="comments.meta && comments.meta.last_page > 1" class="mt-8 flex justify-center gap-2">
          <button v-for="page in comments.meta.last_page" :key="page" @click="$inertia.visit(comments.meta.path + '?page=' + page)" :class="['px-3 py-2 rounded-lg', page === comments.meta.current_page ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700 hover:bg-indigo-50']">
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<style scoped>
.material-icons {
  font-size: 1.2em;
  vertical-align: middle;
}
</style> 