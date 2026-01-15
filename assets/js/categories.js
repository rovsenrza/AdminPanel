let sortable;
let existingSlugs = ['technology', 'software', 'hardware', 'business', 'sports'];

document.addEventListener('DOMContentLoaded', function() {
    initSortable();
    initSlugGeneration();
});

function initSortable() {
    const categoryList = document.getElementById('categoryList');
    if (categoryList) {
        sortable = Sortable.create(categoryList, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            onEnd: function(evt) {
                updateCategoryOrder();
            }
        });
    }
}

function updateCategoryOrder() {
    const items = document.querySelectorAll('.category-item');
    const order = [];
    
    items.forEach((item, index) => {
        order.push({
            id: item.getAttribute('data-id'),
            position: index + 1
        });
    });
    
    console.log('New category order:', order);
    showAlert('Category order updated successfully!', 'success');
}

function editCategory(id) {
    const modal = document.getElementById('editCategoryModal');
    openModal(modal);
    
    console.log('Editing category:', id);
}

function saveCategoryEdit() {
    const name = document.getElementById('editCategoryName').value;
    const parent = document.getElementById('editCategoryParent').value;
    
    if (!name) {
        showAlert('Please enter a category name', 'danger');
        return;
    }
    
    console.log('Saving category:', { name, parent });
    
    const modal = document.getElementById('editCategoryModal');
    closeModal(modal);
    
    showAlert('Category updated successfully!', 'success');
}

function deleteCategory(id) {
    if (confirmDelete('Are you sure you want to delete this category?')) {
        console.log('Deleting category:', id);
        
        const item = document.querySelector(`.category-item[data-id="${id}"]`);
        if (item) {
            item.remove();
            showAlert('Category deleted successfully!', 'success');
        }
    }
}

function initSlugGeneration() {
    const nameInput = document.getElementById('categoryName') || document.getElementById('editCategoryName');
    const slugInput = document.getElementById('categorySlug') || document.getElementById('editCategorySlug');
    
    if (nameInput && slugInput) {
        nameInput.addEventListener('input', async function() {
            const baseSlug = generateSlug(this.value);
            const uniqueSlug = await checkSlugUnique(baseSlug, existingSlugs);
            slugInput.value = uniqueSlug;
        });
    }
}
