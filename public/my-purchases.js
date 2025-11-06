document.addEventListener('DOMContentLoaded', () => {
    const purchaseGrid = document.getElementById('purchase-grid');
    const emptyMsg = document.getElementById('empty-msg');
    const pageTitle = document.querySelector('admin-dashboard__header');
    const logoutButton = document.getElementById('logout-button');

    const currentUserJSON = localStorage.getItem('user');
    let currentUser = null;

    if(currentUserJSON){
        currentUser = JSON.parse(currentUserJSON);
    }
    else{
        console.log('No user in localStorage, redirecting...');
        window.location.href = 'login.html';
        return;
    }
    
});