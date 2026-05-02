        // State
        let currentTab = 'meetings'; // 'meetings' or 'reports'
        
        // Data Structure
        // meetings: [{ id, company, date, time, link }]
        // reports: [{ id, company, date, link }]
        
        const loadData = (key) => JSON.parse(localStorage.getItem(key)) || [];
        const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

        // Elements
        const sidebar = document.querySelector('.sidebar');
        const sidebarBackdrop = document.getElementById('sidebar-backdrop');
        const menuToggleBtn = document.getElementById('menu-toggle-btn');
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.view-section');
        const pageTitle = document.getElementById('page-title');
        const addBtn = document.getElementById('open-modal-btn');
        
        const modal = document.getElementById('add-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const cancelModalBtn = document.getElementById('cancel-modal-btn');
        const addForm = document.getElementById('add-form');
        const modalTitle = document.getElementById('modal-title');
        const formType = document.getElementById('form-type');
        const meetingFields = document.getElementById('meeting-fields');
        const reportDateField = document.getElementById('report-date-field');
        const linkLabel = document.getElementById('link-label');
        
        const meetingsList = document.getElementById('meetings-list');
        const reportsList = document.getElementById('reports-list');
        const meetingsEmpty = document.getElementById('meetings-empty');
        const reportsEmpty = document.getElementById('reports-empty');
        
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-msg');
        const loginScreen = document.getElementById('login-screen');
        const loginForm = document.getElementById('login-form');
        const loginPassword = document.getElementById('login-password');
        const loginError = document.getElementById('login-error');
        const searchInput = document.getElementById('search-input');

        // Initialization
        const init = () => {
            if (localStorage.getItem('go_imports_auth') === 'true') {
                loginScreen.classList.add('hidden');
            }
            renderMeetings();
            renderReports();
            
            // Set today's date as default
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('meeting-date').value = today;
            document.getElementById('report-date').value = today;
        };

        // Navigation Logic
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                currentTab = item.dataset.target;
                
                sections.forEach(sec => sec.classList.remove('active'));
                document.getElementById(`${currentTab}-section`).classList.add('active');
                
                if (currentTab === 'meetings') {
                    pageTitle.textContent = 'Meetings Dashboard';
                    addBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add Meeting`;
                } else {
                    pageTitle.textContent = 'Reports Dashboard';
                    addBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add Report`;
                }
                
                // Close sidebar on mobile after clicking
                if (window.innerWidth <= 992) {
                    toggleSidebar();
                }
            });
        });

        // Mobile Sidebar Toggle
        const toggleSidebar = () => {
            sidebar.classList.toggle('open');
            if (sidebar.classList.contains('open')) {
                sidebarBackdrop.classList.add('active');
            } else {
                sidebarBackdrop.classList.remove('active');
            }
        };

        menuToggleBtn.addEventListener('click', toggleSidebar);
        sidebarBackdrop.addEventListener('click', toggleSidebar);

        // Modal Logic
        const openModal = () => {
            modal.classList.add('active');
            if (currentTab === 'meetings') {
                modalTitle.textContent = 'Schedule New Meeting';
                formType.value = 'meeting';
                meetingFields.style.display = 'grid';
                reportDateField.style.display = 'none';
                document.getElementById('link-field').style.display = 'block';
                document.getElementById('file-field').style.display = 'none';
                document.getElementById('meeting-date').required = true;
                document.getElementById('meeting-time').required = true;
                document.getElementById('report-date').required = false;
                document.getElementById('item-link').required = true;
                document.getElementById('item-file').required = false;
            } else {
                modalTitle.textContent = 'Upload New Report';
                formType.value = 'report';
                meetingFields.style.display = 'none';
                reportDateField.style.display = 'block';
                document.getElementById('link-field').style.display = 'none';
                document.getElementById('file-field').style.display = 'block';
                document.getElementById('meeting-date').required = false;
                document.getElementById('meeting-time').required = false;
                document.getElementById('report-date').required = true;
                document.getElementById('item-link').required = false;
                document.getElementById('item-file').required = true;
            }
        };

        const closeModal = () => {
            modal.classList.remove('active');
            addForm.reset();
            // Re-set default date
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('meeting-date').value = today;
            document.getElementById('report-date').value = today;
        };

        addBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);
        cancelModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        const showToast = (msg) => {
            toastMsg.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        };

        // Auth Logic
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (loginPassword.value === 'admin') {
                localStorage.setItem('go_imports_auth', 'true');
                loginScreen.classList.add('hidden');
                loginError.style.display = 'none';
            } else {
                loginError.style.display = 'block';
            }
        });

        // Search Logic
        searchInput.addEventListener('input', () => {
            renderMeetings();
            renderReports();
        });

        // Form Submission
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const company = document.getElementById('company-name').value;
            
            if (formType.value === 'meeting') {
                const link = document.getElementById('item-link').value;
                const date = document.getElementById('meeting-date').value;
                const time = document.getElementById('meeting-time').value;
                
                const meetings = loadData('gobns_meetings');
                meetings.push({
                    id: Date.now().toString(),
                    company, date, time, link
                });
                saveData('gobns_meetings', meetings);
                renderMeetings();
                showToast('Meeting scheduled successfully.');
                closeModal();
            } else {
                const date = document.getElementById('report-date').value;
                const fileInput = document.getElementById('item-file');
                const file = fileInput.files[0];
                
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const fileDataUrl = e.target.result;
                        
                        const reports = loadData('gobns_reports');
                        reports.push({
                            id: Date.now().toString(),
                            company, date, link: fileDataUrl
                        });
                        saveData('gobns_reports', reports);
                        renderReports();
                        showToast('Report added successfully.');
                        closeModal();
                    };
                    reader.readAsDataURL(file);
                } else {
                    closeModal();
                }
            }
        });

        // Rendering & Deleting Functions
        const deleteItem = (type, id) => {
            if (confirm(`Are you sure you want to remove this ${type}?`)) {
                if (type === 'meeting') {
                    let meetings = loadData('gobns_meetings');
                    meetings = meetings.filter(m => m.id !== id);
                    saveData('gobns_meetings', meetings);
                    renderMeetings();
                    showToast('Meeting removed.');
                } else {
                    let reports = loadData('gobns_reports');
                    reports = reports.filter(r => r.id !== id);
                    saveData('gobns_reports', reports);
                    renderReports();
                    showToast('Report removed.');
                }
            }
        };

        // Attach to window so onclick handlers work
        window.deleteItem = deleteItem;

        const renderMeetings = () => {
            let meetings = loadData('gobns_meetings');
            const query = searchInput.value.trim().toLowerCase();
            if (query) {
                meetings = meetings.filter(m => m.company.toLowerCase().includes(query));
            }

            meetingsList.innerHTML = '';
            
            if (meetings.length === 0) {
                meetingsList.parentElement.style.display = 'none';
                meetingsEmpty.style.display = 'block';
                return;
            }
            
            meetingsList.parentElement.style.display = 'table';
            meetingsEmpty.style.display = 'none';
            
            // Sort by date/time (newest first)
            meetings.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
            
            meetings.forEach(m => {
                const row = document.createElement('tr');
                // Format Date nicely
                const dateObj = new Date(m.date);
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                row.innerHTML = `
                    <td class="company-name">${m.company}</td>
                    <td><span class="badge">${formattedDate}</span></td>
                    <td>${m.time}</td>
                    <td>
                        <a href="${m.link}" target="_blank" class="link-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            Join Meeting
                        </a>
                    </td>
                    <td>
                        <button class="remove-btn" onclick="deleteItem('meeting', '${m.id}')">Remove</button>
                    </td>
                `;
                meetingsList.appendChild(row);
            });
        };

        const renderReports = () => {
            let reports = loadData('gobns_reports');
            const query = searchInput.value.trim().toLowerCase();
            if (query) {
                reports = reports.filter(r => r.company.toLowerCase().includes(query));
            }

            reportsList.innerHTML = '';
            
            if (reports.length === 0) {
                reportsList.parentElement.style.display = 'none';
                reportsEmpty.style.display = 'block';
                return;
            }
            
            reportsList.parentElement.style.display = 'table';
            reportsEmpty.style.display = 'none';
            
            reports.sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
            
            reports.forEach(r => {
                const row = document.createElement('tr');
                const dateObj = new Date(r.date);
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                row.innerHTML = `
                    <td class="company-name">${r.company}</td>
                    <td><span class="badge">${formattedDate}</span></td>
                    <td>
                        <a href="${r.link}" target="_blank" class="link-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            View PDF
                        </a>
                    </td>
                    <td>
                        <button class="remove-btn" onclick="deleteItem('report', '${r.id}')">Remove</button>
                    </td>
                `;
                reportsList.appendChild(row);
            });
        };

        // Run
        init();
