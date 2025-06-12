

<?php $__env->startSection('content'); ?>
<div class="max-w-lg mx-auto py-10 px-4">
    <div class="bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <svg class="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            Add Menu Item
        </h1>
        <form action="<?php echo e(route('menu-items.store')); ?>" method="POST" class="space-y-6">
            <?php echo csrf_field(); ?>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Name</label>
                <input type="text" name="name" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" required>
                <?php $__errorArgs = ['name'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="text-red-500 text-sm mt-1"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Category</label>
                <select name="category" id="category-select" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" required>
                    <option value="">-- Select Category --</option>
                    <?php $__currentLoopData = $categories; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $cat): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($cat); ?>"><?php echo e($cat); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    <option value="__new__">Add new category...</option>
                </select>
                <input type="text" name="category" id="category-input" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition mt-2 hidden" placeholder="Enter new category">
                <?php $__errorArgs = ['category'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="text-red-500 text-sm mt-1"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Price</label>
                <input type="number" name="price" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" min="0" step="0.01" required>
                <?php $__errorArgs = ['price'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="text-red-500 text-sm mt-1"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Dietary Labels <span class="text-xs text-gray-400">(comma separated)</span></label>
                <input type="text" name="dietary_labels" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                <?php $__errorArgs = ['dietary_labels'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="text-red-500 text-sm mt-1"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea name="description" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"></textarea>
                <?php $__errorArgs = ['description'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="text-red-500 text-sm mt-1"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-1">Available</label>
                <select name="available" class="border-2 border-gray-200 rounded-lg w-full p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
                <?php $__errorArgs = ['available'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="text-red-500 text-sm mt-1"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
            </div>
            <div class="flex justify-end gap-2 pt-4 border-t mt-6">
                <a href="<?php echo e(route('menu-items.index')); ?>" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold transition">Cancel</a>
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow transition">Create</button>
            </div>
        </form>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('scripts'); ?>
<script>
document.addEventListener('DOMContentLoaded', function() {
    const select = document.getElementById('category-select');
    const input = document.getElementById('category-input');
    function toggleCategoryField() {
        if (select.value === '__new__') {
            select.classList.add('hidden');
            input.classList.remove('hidden');
            input.required = true;
            input.name = 'category';
            select.name = '';
            input.focus();
        } else {
            select.classList.remove('hidden');
            input.classList.add('hidden');
            input.required = false;
            input.name = '';
            select.name = 'category';
        }
    }
    if (select && input) {
        select.addEventListener('change', toggleCategoryField);
        // On page load, ensure correct field is shown
        toggleCategoryField();
    }
});
</script>
<?php $__env->stopSection(); ?> 
<?php $__env->stopSection(); ?> 
<?php echo $__env->make('layouts.app', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH E:\research\Restaurantbooking\resources\views/menu-items/create.blade.php ENDPATH**/ ?>