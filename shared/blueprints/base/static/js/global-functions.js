// initialize global functions
function initGlobals() {
    tabSwitcher();
    mobileMenu();
    fixedHeader();
    window.addEventListener('resize', function(){
        if (window.innerWidth > 992) {
            document.getElementById('navbar').classList.remove("!top-80");
            document.getElementById('header').classList.remove("!min-h-80");
        }
    });
}

initGlobals();

function mobileMenu() {
    let menuToggler = document.getElementById('menu-toggler');
    let documentBody = document.querySelector('body');
    let navBar = document.getElementById('navbar');
    
    menuToggler.onclick = function(e) {

        menuToggler.classList.toggle('collapsed');
        navBar.classList.toggle('show');

        if (documentBody.style.overflow == 'hidden') {
            documentBody.style.overflow = 'visible'; 
            menuToggler.setAttribute('aria-expanded','true'); 
        } else {
            documentBody.style.overflow = 'hidden';
            menuToggler.setAttribute('aria-expanded','false');
        }
    };

    document.getElementById('main').onclick = function(e) {
        if(e.target != document.getElementById('header')) {
            menuToggler.classList.add('collapsed');
            navBar.classList.remove('show');
            documentBody.style.overflow = 'visible';
        }
    }
}

function tabSwitcher() {
    let tabSections = document.querySelectorAll('.tabs-nav');
    tabSections.forEach(function(tabs) {
        let tabNavigation = tabs.querySelectorAll('li > *');
        tabNavigation.forEach(function(link) {
            link.addEventListener('click', function(e) {
                let activeTab = document.getElementById(e.currentTarget.dataset.tab);
                let allTab = document.getElementById(tabs.dataset.tabcontent).querySelectorAll('.tabs-nav');
                allTab.forEach(function(tab) {
                    tab.style.display = 'none';
                });
                tabNavigation.forEach(function(tabnav) {
                    tabnav.classList.remove('active');
                    tabnav.setAttribute("aria-expanded", false);
                    document.getElementById(tabnav.dataset.tab).style.display = 'none';
                });
                activeTab.style.display = 'block';
                e.currentTarget.classList.add('active');
                e.currentTarget.setAttribute("aria-expanded", true);
            });
        });
    });
}

function fixedHeader() {
    window.onscroll = function toggleFixed() {
        if (window.innerWidth < 992) {
            if (window.scrollY >= 100) {
                document.getElementById('header').classList.add("!min-h-80");
                document.getElementById('navbar').classList.add("!top-80");
            } else {
                document.getElementById('header').classList.remove("!min-h-80");
                document.getElementById('navbar').classList.remove("!top-80");
            }
        }
    }
}