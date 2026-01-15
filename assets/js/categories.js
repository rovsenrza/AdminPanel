let sortable;
let existingSlugs = [];
let categories = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
});

async function loadCategories() {
    const list = document.getElementById('categoryList');
    if (list) {
        list.innerHTML = '<div class="text-center text-muted py-4"><span class="spinner-border spinner-border-sm"></span> Loading categories...</div>';
    }
    
    try {
        const res = await fetch('/backend/api/categories', { credentials: 'include' });
        const data = await res.json();
        categories = data.items || [];
        existingSlugs = categories.map(c => c.slug).filter(Boolean);
        renderCategories();
        updateParentDropdowns();
    } catch (err) {
        console.error('Failed to load categories:', err);
        if (list) {
            list.innerHTML = '<div class="text-center text-danger py-4">Failed to load categories</div>';
        }
    }
}

function renderCategories() {
    const list = document.getElementById('categoryList');
    if (!list) return;
    
    if (categories.length === 0) {
        list.innerHTML = '<div class="text-center text-muted py-4">No categories yet. <a href="categories-add.html">Add your first category</a></div>';
        return;
    }
    
    const sorted = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const byId = new Map(sorted.map(c => [c.id, c]));
    const childrenByParent = new Map();
    
    for (const c of sorted) {
        const key = c.parent_id ? c.parent_id : 0;
        if (!childrenByParent.has(key)) childrenByParent.set(key, []);
        childrenByParent.get(key).push(c);
    }
    
    // Roots are those with no parent OR with missing parent
    const roots = sorted.filter(c => !c.parent_id || !byId.has(c.parent_id));
    
    let html = '';
    for (const root of roots) {
        html += renderCategoryTree(root, 0, childrenByParent);
    }
    
    list.innerHTML = html;
    initSortable();
}

function renderCategoryTree(cat, level, childrenByParent) {
    let html = renderCategoryItem(cat, level);
    const children = childrenByParent.get(cat.id) || [];
    for (const child of children) {
        html += renderCategoryTree(child, level + 1, childrenByParent);
    }
    return html;
}

function renderCategoryItem(cat, level) {
    const parentName = cat.parent_id ? categories.find(c => parseInt(c.id) === parseInt(cat.parent_id))?.name : null;
    const isChild = level > 0;
    const indentStyle = isChild ? ` style="margin-left:${level * 2}rem"` : '';
    return `
        <div class="category-item ${isChild ? 'child' : ''}" data-id="${cat.id}" data-parent="${cat.parent_id || ''}" data-level="${level}"${indentStyle}>
            <div class="category-content">
                <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                <div class="category-info">
                    <h6>${escapeHtml(cat.name)}</h6>
                    <small class="text-muted">${escapeHtml(cat.slug || '')}${parentName ? ' • Child of ' + escapeHtml(parentName) : ''}</small>
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
    `;
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function initSortable() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;
    
    if (sortable) {
        sortable.destroy();
    }
    
    
    sortable = Sortable.create(categoryList, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: function(evt) {
            const item = evt.item;
            const prevItem = item.previousElementSibling;
            const nextItem = item.nextElementSibling;
            
            // Check if dropped on a parent category (make it a child)
            if (prevItem && !prevItem.classList.contains('child') && evt.newIndex > evt.oldIndex) {
                const parentId = parseInt(prevItem.getAttribute('data-id'));
                const itemId = parseInt(item.getAttribute('data-id'));
                // Don't make a category its own child
                if (parentId !== itemId) {
                    setParentCategory(itemId, parentId);
                    return;
                }
            }
            
            updateCategoryOrder();
        }
    });
}

async function setParentCategory(childId, parentId) {
    try {
        const res = await fetch(`/backend/api/categories?id=${childId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parent_id: parentId })
        });
        
        if (res.ok) {
            showAlert('Category moved as subcategory!', 'success');
            await loadCategories();
        } else {
            showAlert('Failed to update category', 'danger');
        }
    } catch (err) {
        showAlert('Error updating category', 'danger');
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
        showAlert('Category order updated!', 'success');
    } catch (err) {
        showAlert('Failed to update order', 'danger');
    }
}

function updateParentDropdowns() {
    const selects = [document.getElementById('editCategoryParent'), document.getElementById('parentCategory')];
    selects.forEach(select => {
        if (!select) return;
        const currentValue = select.value;
        select.innerHTML = '<option value="">None (Main Category)</option>';
        
        // Build full hierarchy - ALL categories (unlimited depth)
        const sorted = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        const parentCats = sorted.filter(c => !c.parent_id);
        
        parentCats.forEach(cat => {
            select.innerHTML += `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`;
            // Add ALL children recursively
            addChildOptionsToDropdown(select, cat.id, sorted, 1);
        });
        
        select.value = currentValue;
    });
}

function addChildOptionsToDropdown(select, parentId, allCategories, level) {
    const children = allCategories.filter(c => c.parent_id === parentId);
    const indent = '\u00A0\u00A0\u00A0'.repeat(level) + '— ';
    children.forEach(child => {
        select.innerHTML += `<option value="${child.id}">${indent}${escapeHtml(child.name)}</option>`;
        // Recursively add ALL sub-children (unlimited depth)
        addChildOptionsToDropdown(select, child.id, allCategories, level + 1);
    });
}

window.editCategory = function(id) {
    // Convert id to number for consistent comparison
    const categoryId = parseInt(id);
    const cat = categories.find(c => parseInt(c.id) === categoryId);
    
    if (!cat) {
        console.error('Category not found:', id, 'Available categories:', categories.map(c => c.id));
        showAlert('Category not found', 'danger');
        return;
    }
    
    const nameInput = document.getElementById('editCategoryName');
    const slugInput = document.getElementById('editCategorySlug');
    const metaTitleInput = document.getElementById('editCategoryMetaTitle');
    const metaDescInput = document.getElementById('editCategoryMetaDesc');
    const metaKeywordsInput = document.getElementById('editCategoryMetaKeywords');
    
    if (!nameInput || !slugInput) {
        console.error('Required form fields not found');
        showAlert('Error: Form fields not found', 'danger');
        return;
    }
    
    nameInput.value = cat.name || '';
    slugInput.value = cat.slug || '';
    
    // Update parent dropdown before setting value
    updateParentDropdowns();
    
    // Wait a bit for dropdown to be populated
    setTimeout(() => {
        const parentSelect = document.getElementById('editCategoryParent');
        if (parentSelect) {
            // Remove self from parent options to prevent circular references
            const selfOption = parentSelect.querySelector(`option[value="${categoryId}"]`);
            if (selfOption) selfOption.remove();
            parentSelect.value = cat.parent_id ? String(cat.parent_id) : '';
        }
    }, 100);
    
    metaTitleInput.value = cat.meta_title || '';
    metaDescInput.value = cat.meta_description || '';
    metaKeywordsInput.value = cat.meta_keywords || '';
    
    const modal = document.getElementById('editCategoryModal');
    if (!modal) {
        console.error('Edit category modal not found');
        showAlert('Error: Edit modal not found', 'danger');
        return;
    }
    
    modal.setAttribute('data-edit-id', categoryId);
    modal.setAttribute('data-original-slug', cat.slug || '');
    
    // Remove old event listeners by cloning and replacing
    const newNameInput = nameInput.cloneNode(true);
    nameInput.parentNode.replaceChild(newNameInput, nameInput);
    newNameInput.value = cat.name || '';
    
    // Add event listener for auto-slug and auto-meta generation
    newNameInput.addEventListener('input', function() {
        const name = this.value.trim();
        // Auto-generate slug from name
        const slugField = document.getElementById('editCategorySlug');
        if (slugField) slugField.value = generateSlug(name);
        // Auto-generate meta title
        const metaTitleField = document.getElementById('editCategoryMetaTitle');
        if (metaTitleField) metaTitleField.value = name;
        // Auto-generate meta description
        const metaDescField = document.getElementById('editCategoryMetaDesc');
        if (metaDescField) metaDescField.value = name ? `Browse all articles in ${name} category` : '';
        // Auto-generate meta keywords
        const metaKeywordsField = document.getElementById('editCategoryMetaKeywords');
        if (metaKeywordsField) metaKeywordsField.value = name ? generateKeywordsFromName(name) : '';
    });
    
    // Use Bootstrap modal
    try {
        // Hide any existing modal instances first
        const existingModal = bootstrap.Modal.getInstance(modal);
        if (existingModal) {
            existingModal.hide();
        }
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    } catch (err) {
        console.error('Error opening modal:', err);
        // Fallback: manually show modal if Bootstrap fails
        modal.classList.add('show');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.id = 'modalBackdrop';
        document.body.appendChild(backdrop);
    }
}

function generateKeywordsFromName(name) {
    const words = name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    return words.join(', ');
}

window.saveCategoryEdit = async function() {
    const modal = document.getElementById('editCategoryModal');
    if (!modal) {
        showAlert('Error: Modal not found', 'danger');
        return;
    }
    
    const idStr = modal.getAttribute('data-edit-id');
    if (!idStr) {
        showAlert('Error: Category ID not found', 'danger');
        return;
    }
    
    const id = parseInt(idStr);
    if (isNaN(id) || id <= 0) {
        showAlert('Error: Invalid category ID', 'danger');
        return;
    }
    
    const nameInput = document.getElementById('editCategoryName');
    const slugInput = document.getElementById('editCategorySlug');
    const parentSelect = document.getElementById('editCategoryParent');
    const metaTitleInput = document.getElementById('editCategoryMetaTitle');
    const metaDescInput = document.getElementById('editCategoryMetaDesc');
    const metaKeywordsInput = document.getElementById('editCategoryMetaKeywords');
    
    if (!nameInput || !slugInput) {
        showAlert('Error: Required form fields not found', 'danger');
        return;
    }
    
    const name = nameInput.value.trim();
    const slug = slugInput.value.trim();
    const parent = parentSelect ? parentSelect.value : '';
    const metaTitle = metaTitleInput ? metaTitleInput.value.trim() : '';
    const metaDesc = metaDescInput ? metaDescInput.value.trim() : '';
    const metaKeywords = metaKeywordsInput ? metaKeywordsInput.value.trim() : '';
    
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
                meta_description: metaDesc,
                meta_keywords: metaKeywords
            })
        });
        
        if (res.ok) {
            // Hide modal properly
            try {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                } else {
                    // Fallback: manually hide modal
                    modal.classList.remove('show');
                    modal.style.display = 'none';
                    document.body.classList.remove('modal-open');
                    const backdrop = document.getElementById('modalBackdrop');
                    if (backdrop) backdrop.remove();
                }
            } catch (modalErr) {
                console.error('Error hiding modal:', modalErr);
            }
            
            showAlert('Category updated successfully!', 'success');
            await loadCategories();
        } else {
            const errorData = await res.json().catch(() => ({}));
            showAlert(errorData.error || 'Failed to update category', 'danger');
        }
    } catch (err) {
        console.error('Error updating category:', err);
        showAlert('Error updating category: ' + err.message, 'danger');
    }
}

window.deleteCategory = async function(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    const categoryId = parseInt(id);
    if (isNaN(categoryId) || categoryId <= 0) {
        showAlert('Error: Invalid category ID', 'danger');
        return;
    }
    
    try {
        const res = await fetch(`/backend/api/categories?id=${categoryId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (res.ok) {
            showAlert('Category deleted successfully!', 'success');
            await loadCategories();
        } else {
            const data = await res.json().catch(() => ({}));
            showAlert(data.error || 'Failed to delete category', 'danger');
        }
    } catch (err) {
        console.error('Error deleting category:', err);
        showAlert('Error deleting category: ' + err.message, 'danger');
    }
}
