

<?php $__env->startSection('content'); ?>
<div class="max-w-2xl mx-auto py-10 px-4">
    <div class="bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <svg class="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            Menu Categories
        </h1>
        <?php if(session('success')): ?>
            <div class="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded mb-4 shadow"><?php echo e(session('success')); ?></div>
        <?php endif; ?>
        <div class="mb-4 flex justify-end">
            <a href="<?php echo e(route('menu-categories.create')); ?>" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow flex items-center gap-2 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                Add Category
            </a>
        </div>
        <table class="min-w-full">
            <thead>
                <tr>
                    <th class="py-2 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                    <th class="py-2 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php $__empty_1 = true; $__currentLoopData = $categories; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $category): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr class="hover:bg-blue-50 transition">
                        <td class="py-2 px-4"><?php echo e($category->name); ?></td>
                        <td class="py-2 px-4 flex gap-2">
                            <a href="<?php echo e(route('menu-categories.edit', $category)); ?>" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow text-xs font-bold transition">Edit</a>
                            <form action="<?php echo e(route('menu-categories.destroy', $category)); ?>" method="POST" onsubmit="return confirm('Delete this category?')">
                                <?php echo csrf_field(); ?>
                                <?php echo method_field('DELETE'); ?>
                                <button type="submit" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow text-xs font-bold transition">Delete</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr><td colspan="2" class="text-center text-gray-400 py-6">No categories found.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
<?php $__env->stopSection(); ?> 
<?php echo $__env->make('layouts.app', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH E:\research\Restaurantbooking\resources\views/menu-categories/index.blade.php ENDPATH**/ ?>