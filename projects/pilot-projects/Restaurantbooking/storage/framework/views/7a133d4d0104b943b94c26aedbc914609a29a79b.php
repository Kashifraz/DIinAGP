

<?php $__env->startSection('content'); ?>
<div class="bg-gradient-to-r from-green-100 to-blue-100 py-12 mb-8">
    <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800">Welcome to Our Restaurant</h1>
        <p class="text-lg md:text-xl text-gray-600 mb-6">Discover our delicious menu, crafted with fresh ingredients and passion. Book your table or order online today!</p>
        <a href="<?php echo e(route('reservations.create')); ?>" class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow">Book a Table</a>
    </div>
</div>
<div class="container mx-auto px-4">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Our Menu</h2>
    <?php $__currentLoopData = $categories; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $category => $items): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
        <div class="mb-10">
            <h3 class="text-xl font-semibold mb-4 text-blue-700 border-b-2 border-blue-200 pb-2"><?php echo e($category); ?></h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <?php $__currentLoopData = $items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <div id="dish-<?php echo e($item->id); ?>" class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                        <div class="h-40 bg-gray-200 flex items-center justify-center">
                            <img src="https://source.unsplash.com/400x300/?food,<?php echo e(urlencode($item->name)); ?>" alt="<?php echo e($item->name); ?>" class="object-cover h-full w-full">
                        </div>
                        <div class="p-4">
                            <h4 class="text-lg font-bold mb-1 text-gray-900"><?php echo e($item->name); ?></h4>
                            <div class="text-green-700 font-semibold mb-2 text-base">$<?php echo e(number_format($item->price, 2)); ?></div>
                            <div class="mb-2 text-gray-600 text-sm"><?php echo e($item->description); ?></div>
                            <div class="mb-2">
                                <?php $__currentLoopData = explode(',', $item->dietary_labels); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $label): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <?php if(trim($label)): ?>
                                        <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"><?php echo e(trim($label)); ?></span>
                                    <?php endif; ?>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            </div>
                            <div class="flex flex-wrap gap-2 mt-2">
                                <a href="<?php echo e(route('reservations.create')); ?>" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">Book Now</a>
                                <?php if(auth()->guard()->check()): ?>
                                    <a href="<?php echo e(route('orders.create', ['dish' => $item->id])); ?>" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition">Order Now</a>
                                <?php else: ?>
                                    <a href="<?php echo e(route('login')); ?>" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition">Order Now</a>
                                <?php endif; ?>
                            </div>
                            <div class="mt-4">
                                <h5 class="font-semibold text-gray-700 mb-2">Customer Reviews</h5>
                                <?php if($item->reviews->count()): ?>
                                    <div class="space-y-2 mb-2">
                                        <?php $__currentLoopData = $item->reviews->take(3); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $review): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                            <div class="bg-gray-50 p-2 rounded">
                                                <div class="flex items-center mb-1">
                                                    <span class="font-bold text-sm text-gray-800 mr-2"><?php echo e($review->user->name); ?></span>
                                                    <span class="text-yellow-500 text-xs"><?php for($i=0;$i<$review->rating;$i++): ?>★<?php endfor; ?></span>
                                                </div>
                                                <div class="text-gray-600 text-sm"><?php echo e($review->comment); ?></div>
                                            </div>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                    </div>
                                    <?php if($item->reviews->count() > 3): ?>
                                        <div class="text-xs text-gray-500">And <?php echo e($item->reviews->count() - 3); ?> more reviews...</div>
                                    <?php endif; ?>
                                <?php else: ?>
                                    <div class="text-gray-400 text-sm">No reviews yet.</div>
                                <?php endif; ?>
                                <?php if(auth()->guard()->check()): ?>
                                    <form action="<?php echo e(route('reviews.store', $item)); ?>" method="POST" class="mt-2">
                                        <?php echo csrf_field(); ?>
                                        <div class="flex items-center gap-2 mb-1">
                                            <label for="rating-<?php echo e($item->id); ?>" class="text-sm">Your Rating:</label>
                                            <select name="rating" id="rating-<?php echo e($item->id); ?>" class="border rounded p-1 text-sm">
                                                <?php for($i=1;$i<=5;$i++): ?>
                                                    <option value="<?php echo e($i); ?>"><?php echo e($i); ?></option>
                                                <?php endfor; ?>
                                            </select>
                                        </div>
                                        <textarea name="comment" rows="2" class="border rounded w-full p-2 text-sm mb-1" placeholder="Your review..." required></textarea>
                                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">Submit Review</button>
                                    </form>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </div>
        </div>
    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
</div>
<?php $__env->stopSection(); ?> 
<?php echo $__env->make('layouts.app', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH E:\research\Restaurantbooking\resources\views/menu-items/landing.blade.php ENDPATH**/ ?>