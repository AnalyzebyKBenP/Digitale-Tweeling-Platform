// initialize global functions
function initGlobals() {
    tabSwitcher();
    mobileMenu();
    fixedHeader();
    btnGroup();
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
    let tabSections = document.querySelectorAll('.tab-section');
    tabSections.forEach(function(tabs) {
        let tabButtons = tabs.querySelectorAll('.tab-buttons > button');
        tabButtons.forEach(function(tab) {
            tab.addEventListener('click', function(e) {
                const contentTab = document.getElementById(e.currentTarget.dataset.tab);
                e.currentTarget.parentElement.querySelector('.active').classList.remove('active');
                contentTab.parentElement.querySelector('.active').classList.remove('active');
                e.currentTarget.classList.add('active');
                contentTab.classList.add('active');
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

function btnGroup() {
    let btnSections = document.querySelectorAll('.btn-group');
    btnSections.forEach(function(btngroup) {
        let btns = btngroup.querySelectorAll('.btn-group > button');
        btns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                if(e.currentTarget.parentElement.querySelector('.active')) {
                    e.currentTarget.parentElement.querySelector('.active').classList.remove('active');
                }
                e.currentTarget.classList.add('active');
            });
        });
    });
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }