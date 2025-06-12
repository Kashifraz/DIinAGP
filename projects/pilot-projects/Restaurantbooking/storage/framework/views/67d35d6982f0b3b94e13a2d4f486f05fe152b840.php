

<?php $__env->startSection('content'); ?>
<div class="max-w-lg mx-auto py-10 px-4">
    <div class="bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <svg class="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            Add Table
        </h1>
        <form action="<?php echo e(route('tables.store')); ?>" method="POST" class="space-y-6">
            <?php echo csrf_field(); ?>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Number</label>
                <div class="relative">
                    <input type="text" name="number" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" required>
                    <span class="absolute right-3 top-3 text-gray-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg></span>
                </div>
                <?php $__errorArgs = ['number'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="text-red-500 text-sm mt-1"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Seats</label>
                <div class="relative">
                    <input type="number" name="seats" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" min="1" required>
                    <span class="absolute right-3 top-3 text-gray-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></span>
                </div>
                <?php $__errorArgs = ['seats'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="text-red-500 text-sm mt-1"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Status</label>
                <select name="status" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="unavailable">Unavailable</option>
                </select>
                <?php $__errorArgs = ['status'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="text-red-500 text-sm mt-1"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
            </div>
            <div class="flex justify-end gap-2 pt-4 border-t mt-6">
                <a href="<?php echo e(route('tables.index')); ?>" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold transition">Cancel</a>
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow transition">Create</button>
            </div>
        </form>
    </div>
</div>
<?php $__env->stopSection(); ?> 
<?php echo $__env->make('layouts.app', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH E:\research\Restaurantbooking\resources\views/tables/create.blade.php ENDPATH**/ ?>