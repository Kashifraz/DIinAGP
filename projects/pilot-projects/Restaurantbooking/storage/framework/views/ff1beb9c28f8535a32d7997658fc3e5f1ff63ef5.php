

<?php $__env->startSection('content'); ?>
<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Add Order</h1>
    <?php if(isset($selectedDish) && $selectedDish): ?>
        <div class="mb-4 p-4 bg-blue-50 rounded">
            <div class="font-semibold text-blue-700">Ordering: <?php echo e($selectedDish->name); ?></div>
            <div class="text-gray-600">$<?php echo e(number_format($selectedDish->price, 2)); ?></div>
            <div class="text-sm text-gray-500"><?php echo e($selectedDish->description); ?></div>
        </div>
    <?php endif; ?>
    <form action="<?php echo e(route('orders.store')); ?>" method="POST" class="space-y-4">
        <?php echo csrf_field(); ?>
        <div>
            <label class="block">Reservation</label>
            <select name="reservation_id" class="border rounded w-full p-2" required>
                <option value="">Select Reservation</option>
                <?php $__currentLoopData = $reservations; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $reservation): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <option value="<?php echo e($reservation->id); ?>">#<?php echo e($reservation->id); ?> (Table: <?php echo e($reservation->table->number ?? '-'); ?>, <?php echo e($reservation->time_slot); ?>)</option>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </select>
            <?php $__errorArgs = ['reservation_id'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="text-red-500"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
        </div>
        <div>
            <label class="block">Status</label>
            <select name="status" class="border rounded w-full p-2">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>
            <?php $__errorArgs = ['status'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="text-red-500"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
        </div>
        <div>
            <label class="block">Total</label>
            <input type="number" name="total" class="border rounded w-full p-2" min="0" step="0.01" required <?php if(isset($selectedDish) && $selectedDish): ?> value="<?php echo e($selectedDish->price); ?>" <?php endif; ?>>
            <?php $__errorArgs = ['total'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="text-red-500"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
        </div>
        <div>
            <label class="block">Paid</label>
            <select name="paid" class="border rounded w-full p-2">
                <option value="1">Yes</option>
                <option value="0">No</option>
            </select>
            <?php $__errorArgs = ['paid'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="text-red-500"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
        </div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
        <a href="<?php echo e(route('orders.index')); ?>" class="ml-2 text-gray-600">Cancel</a>
    </form>
</div>
<?php $__env->stopSection(); ?> 
<?php echo $__env->make('layouts.app', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH E:\research\Restaurantbooking\resources\views/orders/create.blade.php ENDPATH**/ ?>