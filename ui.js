/**
 * Shared UI components for Montessori Application
 * Handles custom alerts and help modals
 */

function showModal(title, text, type = 'info') {
    // Create modal if it doesn't exist
    let modal = document.getElementById('custom-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'custom-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div id="modal-title" class="modal-title"></div>
                <div id="modal-text" class="modal-text"></div>
                <button id="modal-close" class="modal-button">OK!</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('modal-close').onclick = () => {
            modal.style.display = 'none';
        };
    }

    const titleEl = document.getElementById('modal-title');
    const textEl = document.getElementById('modal-text');
    const contentEl = modal.querySelector('.modal-content');

    titleEl.innerText = title;
    textEl.innerText = text;

    // Adjust style based on type
    if (type === 'success') {
        titleEl.style.color = '#2ecc71';
        contentEl.style.borderColor = '#2ecc71';
    } else if (type === 'error') {
        titleEl.style.color = '#e74c3c';
        contentEl.style.borderColor = '#e74c3c';
    } else {
        titleEl.style.color = '#f1c40f';
        contentEl.style.borderColor = '#f1c40f';
    }

    modal.style.display = 'flex';
}

function setupHelp(helpText) {
    const container = document.querySelector('.container');
    if (!container) return;

    // Check if help button already exists
    if (document.querySelector('.help-button')) return;

    const helpBtn = document.createElement('div');
    helpBtn.className = 'help-button';
    helpBtn.innerText = '?';
    helpBtn.title = 'Kliknij po pomoc!';
    helpBtn.onclick = () => {
        showModal('Jak wykonać zadanie?', helpText, 'info');
    };

    container.appendChild(helpBtn);
}

// Override window.alert for child-friendly messages
// Note: We might want to use a more specific function name to avoid conflicts
window.showFriendlyAlert = (message, type = 'info') => {
    let title = 'Informacja';
    if (type === 'success') title = 'Super! 🌟';
    if (type === 'error') title = 'Ojej... 💡';
    
    showModal(title, message, type);
};
