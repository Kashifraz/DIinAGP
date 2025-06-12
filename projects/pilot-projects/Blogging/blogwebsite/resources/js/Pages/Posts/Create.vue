<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm, router } from '@inertiajs/vue3';
import { ref } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import Modal from '@/Components/Modal.vue';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import { toast } from 'vue3-toastify';

const props = defineProps({ allTags: Array, allCategories: Array });
const form = useForm({
    title: '',
    excerpt: '',
    content: '',
    status: 'draft',
    tags: [],
    category_id: null,
});

if (form.category_id === null && props.allCategories && props.allCategories.length > 0) {
    form.category_id = props.allCategories[0].id;
}

const editor = ref(new Editor({
    extensions: [
        StarterKit,
        Image,
        Underline,
        Strike,
        Blockquote,
        CodeBlock,
        Link,
        HorizontalRule,
    ],
    content: '',
    onUpdate: ({ editor }) => {
        form.content = editor.getHTML();
    },
}));

const showImageModal = ref(false);
const showLinkModal = ref(false);
const imageUrl = ref('');
const linkUrl = ref('');
const heroImage = ref(null);
const heroImagePreview = ref(null);

function onHeroImageChange(e) {
    const file = e.target.files[0];
    if (file) {
        heroImage.value = file;
        heroImagePreview.value = URL.createObjectURL(file);
    } else {
        heroImage.value = null;
        heroImagePreview.value = null;
    }
}

function submit() {
    form.tags = form.tags.map(tag => typeof tag === 'string' ? tag : tag.name);
    if (form.category_id !== null && form.category_id !== '') {
        form.category_id = Number(form.category_id);
    }
    const data = new FormData();
    Object.entries(form.data()).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(v => data.append(key + '[]', v));
        } else {
            data.append(key, value);
        }
    });
    if (heroImage.value) {
        data.append('hero_image', heroImage.value);
    }
    router.post(route('posts.store'), data, {
        forceFormData: true,
        onError: (errors) => {
            Object.values(errors).forEach(msg => toast.error(msg));
        },
    });
}

function openImageModal() {
    imageUrl.value = '';
    showImageModal.value = true;
}

function openLinkModal() {
    linkUrl.value = '';
    showLinkModal.value = true;
}

function insertImage() {
    if (imageUrl.value) {
        editor.value.chain().focus().setImage({ src: imageUrl.value }).run();
    }
    showImageModal.value = false;
}

function insertLink() {
    if (linkUrl.value) {
        editor.value.chain().focus().setLink({ href: linkUrl.value }).run();
    }
    showLinkModal.value = false;
}

function tagLabel(tag) {
    return tag.name || tag;
}
</script>

<template>
    <Head title="Create Post" />
    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Create Post</h2>
        </template>
        <div class="py-12">
            <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white shadow sm:rounded-lg p-6">
                    <form @submit.prevent="submit" class="space-y-6">
                        <div>
                            <label class="block font-medium">Title</label>
                            <input v-model="form.title" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition" required />
                        </div>
                        <div>
                            <label class="block font-medium">Excerpt</label>
                            <textarea v-model="form.excerpt" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"></textarea>
                        </div>
                        <div>
                            <label class="block font-medium">Content</label>
                            <div v-if="editor">
                                <div class="mb-2 flex flex-wrap gap-2">
                                    <button type="button" @click="editor.chain().focus().undo().run()" title="Undo">⎌</button>
                                    <button type="button" @click="editor.chain().focus().redo().run()" title="Redo">⎌⎌</button>
                                    <span class="mx-2">|</span>
                                    <button type="button" @click="editor.chain().focus().toggleBold().run()" :class="{'font-bold': editor.isActive('bold')}">B</button>
                                    <button type="button" @click="editor.chain().focus().toggleItalic().run()" :class="{'italic': editor.isActive('italic')}">I</button>
                                    <button type="button" @click="editor.chain().focus().toggleUnderline().run()" :class="{'underline': editor.isActive('underline')}">U</button>
                                    <button type="button" @click="editor.chain().focus().toggleStrike().run()" :class="{'line-through': editor.isActive('strike')}">S</button>
                                    <span class="mx-2">|</span>
                                    <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{'font-bold underline': editor.isActive('heading', { level: 1 })}">H1</button>
                                    <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{'font-bold underline': editor.isActive('heading', { level: 2 })}">H2</button>
                                    <button type="button" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{'font-bold underline': editor.isActive('heading', { level: 3 })}">H3</button>
                                    <span class="mx-2">|</span>
                                    <button type="button" @click="editor.chain().focus().toggleBulletList().run()" :class="{'font-bold': editor.isActive('bulletList')}">• List</button>
                                    <button type="button" @click="editor.chain().focus().toggleOrderedList().run()" :class="{'font-bold': editor.isActive('orderedList')}">1. List</button>
                                    <span class="mx-2">|</span>
                                    <button type="button" @click="editor.chain().focus().toggleBlockquote().run()" :class="{'italic': editor.isActive('blockquote')}">❝</button>
                                    <button type="button" @click="editor.chain().focus().toggleCodeBlock().run()" :class="{'bg-gray-200': editor.isActive('codeBlock')}">{ }</button>
                                    <button type="button" @click="editor.chain().focus().setHorizontalRule().run()">―</button>
                                    <span class="mx-2">|</span>
                                    <button type="button" @click="openLinkModal" title="Insert Link">🔗</button>
                                    <button type="button" @click="openImageModal" title="Insert Image">🖼️</button>
                                </div>
                                <EditorContent :editor="editor" class="prose border rounded min-h-[200px] w-full" />
                            </div>
                        </div>
                        <div>
                            <label class="block font-medium">Status</label>
                            <select v-model="form.status" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-medium">Category</label>
                            <select v-model="form.category_id" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition">
                                <option v-if="!props.allCategories.length" disabled value="">
                                    No categories found
                                </option>
                                <option v-for="cat in props.allCategories" :key="cat.id" :value="cat.id">
                                    {{ cat.name }}
                                </option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-medium">Tags</label>
                            <Multiselect
                                v-model="form.tags"
                                :options="props.allTags"
                                :multiple="true"
                                :taggable="true"
                                label="name"
                                track-by="name"
                                placeholder="Add tags..."
                                @tag="(newTag) => form.tags.push({ name: newTag })"
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                        <div>
                            <label class="block font-medium">Hero Image</label>
                            <input type="file" accept="image/*" @change="onHeroImageChange" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition" />
                            <div v-if="heroImagePreview" class="mt-2">
                                <img :src="heroImagePreview" alt="Hero Preview" class="h-40 rounded-lg object-cover border" />
                            </div>
                        </div>
                        <div>
                            <PrimaryButton type="submit">Save</PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <!-- Image Modal -->
        <Modal :show="showImageModal" @close="showImageModal = false">
            <div class="p-6">
                <h2 class="text-lg font-semibold mb-4">Insert Image</h2>
                <input v-model="imageUrl" type="text" placeholder="Image URL" class="w-full border rounded mb-4" />
                <div class="flex justify-end gap-2">
                    <PrimaryButton type="button" @click="showImageModal = false">Cancel</PrimaryButton>
                    <PrimaryButton type="button" @click="insertImage">Insert</PrimaryButton>
                </div>
            </div>
        </Modal>
        <!-- Link Modal -->
        <Modal :show="showLinkModal" @close="showLinkModal = false">
            <div class="p-6">
                <h2 class="text-lg font-semibold mb-4">Insert Link</h2>
                <input v-model="linkUrl" type="text" placeholder="Link URL" class="w-full border rounded mb-4" />
                <div class="flex justify-end gap-2">
                    <PrimaryButton type="button" @click="showLinkModal = false">Cancel</PrimaryButton>
                    <PrimaryButton type="button" @click="insertLink">Insert</PrimaryButton>
                </div>
            </div>
        </Modal>
    </AuthenticatedLayout>
</template> 