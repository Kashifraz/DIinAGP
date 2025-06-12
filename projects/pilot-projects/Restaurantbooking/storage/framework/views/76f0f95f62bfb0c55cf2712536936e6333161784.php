

<?php $__env->startSection('content'); ?>
<div class="max-w-7xl mx-auto py-8 px-4">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
            <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            Menu Items
        </h1>
        <a href="<?php echo e(route('menu-items.create')); ?>" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow flex items-center gap-2 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            Add Menu Item
        </a>
    </div>
    <?php if(session('success')): ?>
        <div class="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded mb-4 shadow"><?php echo e(session('success')); ?></div>
    <?php endif; ?>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <?php $__empty_1 = true; $__currentLoopData = $menuItems; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                <div class="h-40 bg-gray-100 flex items-center justify-center">
                    <img src="https://source.unsplash.com/400x300/?food,<?php echo e(urlencode($item->name)); ?>" alt="<?php echo e($item->name); ?>" class="object-cover h-full w-full">
                </div>
                <div class="p-4 flex-1 flex flex-col">
                    <div class="flex items-center justify-between mb-2">
                        <h2 class="text-lg font-bold text-gray-900"><?php echo e($item->name); ?></h2>
                        <span class="text-green-700 font-semibold text-base">$<?php echo e(number_format($item->price, 2)); ?></span>
                    </div>
                    <div class="mb-2 text-sm text-gray-500"><?php echo e($item->category); ?></div>
                    <div class="mb-2 flex flex-wrap gap-1">
                        <?php $__currentLoopData = explode(',', $item->dietary_labels); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $label): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <?php if(trim($label)): ?>
                                <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"><?php echo e(trim($label)); ?></span>
                            <?php endif; ?>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </div>
                    <div class="mb-2 text-gray-600 text-xs line-clamp-2"><?php echo e($item->description); ?></div>
                    <div class="mb-2">
                        <?php if($item->available): ?>
                            <span class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4-4"/></svg>Available</span>
                        <?php else: ?>
                            <span class="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>Unavailable</span>
                        <?php endif; ?>
                    </div>
                    <div class="flex gap-2 mt-auto">
                        <a href="<?php echo e(route('menu-items.edit', $item)); ?>" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow text-xs font-bold transition">Edit</a>
                        <form action="<?php echo e(route('menu-items.destroy', $item)); ?>" method="POST" onsubmit="return confirm('Delete this menu item?')">
                            <?php echo csrf_field(); ?>
                            <?php echo method_field('DELETE'); ?>
                            <button type="submit" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow text-xs font-bold transition">Delete</button>
                        </form>
                    </div>
                </div>
            </div>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
            <div class="col-span-full text-center text-gray-400 py-12">No menu items found.</div>
        <?php endif; ?>
    </div>
</div>
<?php $__env->stopSection(); ?> 
<?php echo $__env->make('layouts.app', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH E:\research\Restaurantbooking\resources\views/menu-items/index.blade.php ENDPATH**/ ?>