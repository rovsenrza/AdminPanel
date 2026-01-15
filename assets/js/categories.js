let sortable;
let existingSlugs = [];
let categories = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    initSortable();
    initSlugGeneration();
});

async function loadCategories() {
    try {
        const res = await fetch('/backend/api/categories', { credentials: 'include' });
        const data = await res.json();
        categories = data.items || [];
        existingSlugs = categories.map(c => c.slug).filter(Boolean);
        renderCategories();
    } catch (err) {
        console.error('Failed to load categories:', err);
    }
}

function renderCategories() {
    const list = document.getElementById('categoryList');
    if (!list) return;
    
    list.innerHTML = categories.map(cat => `
        <div class="category-item" data-id="${cat.id}">
            <div class="category-content">
                <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                <div class="category-info">
                    <h6>${cat.name}</h6>
                    <small class="text-muted">${cat.slug || ''}</small>
                </div>
            </div>
            <div class="category-actions">
                <button class="btn btn-sm btn-icon btn-primary" onclick="editCategory(${cat.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-icon btn-danger" onclick="deleteCategory(${cat.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    if (sortable) {
        sortable.destroy();
    }
    initSortable();
}

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

async function updateCategoryOrder() {
    const items = document.querySelectorAll('.category-item');
    const updates = [];
    
    items.forEach((item, index) => {
        const id = parseInt(item.getAttribute('data-id'));
        updates.push(
            fetch(`/backend/api/categories?id=${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sort_order: index })
            })
        );
    });
    
    try {
        await Promise.all(updates);
        showAlert('Category order updated successfully!', 'success');
    } catch (err) {
        showAlert('Failed to update order', 'danger');
    }
}

function editCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    
    document.getElementById('editCategoryName').value = cat.name || '';
    document.getElementById('editCategorySlug').value = cat.slug || '';
    document.getElementById('editCategoryParent').value = cat.parent_id || '';
    document.getElementById('editCategoryMetaTitle').value = cat.meta_title || '';
    document.getElementById('editCategoryMetaDesc').value = cat.meta_description || '';
    
    const modal = document.getElementById('editCategoryModal');
    modal.setAttribute('data-edit-id', id);
    openModal(modal);
}

async function saveCategoryEdit() {
    const modal = document.getElementById('editCategoryModal');
    const id = parseInt(modal.getAttribute('data-edit-id'));
    
    const name = document.getElementById('editCategoryName').value.trim();
    const slug = document.getElementById('editCategorySlug').value.trim();
    const parent = document.getElementById('editCategoryParent').value;
    const metaTitle = document.getElementById('editCategoryMetaTitle').value.trim();
    const metaDesc = document.getElementById('editCategoryMetaDesc').value.trim();
    
    if (!name) {
        showAlert('Please enter a category name', 'danger');
        return;
    }
    
    try {
        const res = await fetch(`/backend/api/categories?id=${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                slug,
                parent_id: parent ? parseInt(parent) : null,
                meta_title: metaTitle,
                meta_description: metaDesc
            })
        });
        
        if (res.ok) {
            closeModal(modal);
            showAlert('Category updated successfully!', 'success');
            await loadCategories();
        } else {
            showAlert('Failed to update category', 'danger');
        }
    } catch (err) {
        showAlert('Error updating category', 'danger');
    }
}

async function deleteCategory(id) {
    if (!confirmDelete('Are you sure you want to delete this category?')) return;
    
    try {
        const res = await fetch(`/backend/api/categories?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (res.ok) {
            showAlert('Category deleted successfully!', 'success');
            await loadCategories();
        } else {
            showAlert('Failed to delete category', 'danger');
        }
    } catch (err) {
        showAlert('Error deleting category', 'danger');
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
