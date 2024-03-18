// initialize atlas functions

function initAtlas() {
    phoneFilterControls();
    tabButtons();
    moveTabs();
    layerButtonsSwitch();

    window.addEventListener('resize', moveTabs);

    let buttonObserver = new MutationObserver(sidepanelButtons);
    buttonObserver.observe(
        document.getElementById('sidebar-menu-generatedlist'),
        {childList: true}
    );
}

initAtlas();

function sidepanelButtons() {
    let dropdownBtns = document.querySelectorAll('#datalayers-panel .dropdown-btn');
    dropdownBtns.forEach(function(dropdownBtn) {
        dropdownBtn.addEventListener('click', function(e) {
            e.currentTarget.classList.toggle("active");
            e.currentTarget.nextElementSibling.classList.toggle("active");
            e.currentTarget.nextElementSibling.classList.toggle("rs_skip");
        });
    });
}

function toggleSimplePanel(target,panel) {
    document.getElementById(target).classList.toggle('active');
    document.getElementById(panel).classList.toggle('show');
    if(target == 'map-sidepanel-btn') {
        document.getElementById('map_controls_3D').classList.toggle('active');
    }
    if(!document.getElementById('sidepanel').classList.contains('show') && 
        document.querySelector('aside[id$="-panel"].full')) {
            document.querySelector('aside[id$="-panel"].full').classList.remove('active-sidepanel');
    } else if(document.querySelector('aside[id$="-panel"].full')) {
        document.querySelector('aside[id$="-panel"].full').classList.add('active-sidepanel');
    }
}

function togglePanel(button,tabPanel,startSize = false) {
    const panel = button.closest('[id$="-panel"]');
    if(!button.classList.contains('active')) {
        if(startSize && !panel.classList.contains('show')) {
            panel.querySelector(`[data-size="${startSize}"]`).click();
        }
        if(panel.querySelector('#sidepanel-buttons > button.active')) {
            panel.querySelector('#sidepanel-buttons > button.active').classList.remove('active')
        }
        button.classList.add('active');
        panel.classList.add('show');
        if(panel.querySelector('.active.fade')) {
            panel.querySelector('.active.fade').classList.remove('active','fade');
        }
    } else {
        panel.querySelector('#sidepanel-buttons > button.active').classList.remove('active');
        panel.classList.remove('show');
    }
    panel.querySelector('#' + tabPanel).classList.add('active');
    setTimeout(function(){
        panel.querySelector('#' + tabPanel).classList.add('fade');
    },10);
}

function activateSizeBtn(button) {
    const panelSelector = button.closest('aside[id$="-panel"]');
    if(button.dataset.size === 'close') {
        panelSelector.classList.remove('show');
        document.querySelector('body').classList.remove('fullscreen');
        panelSelector.querySelector('button.active').classList.remove('active');
        if(panelSelector.classList.contains('fullscreen')) {
            panelSelector.classList.remove('fullscreen');
            panelSelector.classList.add('half');
            panelSelector.querySelector('.size-buttons .active').classList.remove('active');
            panelSelector.querySelector('div[data-size="half"]').classList.add('active');
        }
    } else {
        panelSelector.querySelectorAll('.size-btn').forEach(function(e){
            e.classList.remove('active');
            panelSelector.classList.remove('active-sidepanel');
            panelSelector.classList.remove(e.dataset.size);
        });
        if(document.getElementById('sidepanel').classList.contains('show')) {
            panelSelector.classList.add('active-sidepanel');
        }
        if(button.dataset.size === 'fullscreen') {
            document.querySelector('body').classList.add('fullscreen');    
        } else {
            document.querySelector('body').classList.remove('fullscreen');
        }
        button.classList.add('active');
        panelSelector.classList.add(button.dataset.size);
    }
}

function dashboardTab(button) {
    document.querySelector('#info-tabs .active').classList.remove('active');
    document.querySelector('#tab-content .active').classList.remove('active','fade');
    button.classList.add('active');
    document.querySelector(`div[id="${button.dataset.tab}-tab"`).classList.add('active');
    setTimeout(function(){
        document.querySelector(`div[id="${button.dataset.tab}-tab"`).classList.add('fade');
    },10);
}

function tabButtons() {
    let btns = document.querySelectorAll('#tab-group > button');
    let sidepanel = document.getElementById('sidepanel');

    btns.forEach(function(btn) {
        if(!sidepanel.hasAttribute('height')) {
            sidepanel.style.height = '50dvh';
        }
        btn.addEventListener('click', function(e) {
            btns.forEach(function(notTarget) {
                notTarget.classList.remove("active");
                notTarget.setAttribute("aria-expanded", false);
            });
            document.querySelectorAll('#panels > div:not(#moveable-panels)').forEach(function(tab) {
                tab.style.display = 'none';
            });
            document.querySelectorAll('#moveable-panels > div').forEach(function(tab) {
                tab.style.display = 'none';
            });
            e.currentTarget.classList.add("active");
            document.getElementById(e.currentTarget.dataset.tab).style.display = 'block';
            e.currentTarget.setAttribute("aria-expanded", true);
        });
    });

    if(btns.length > 3) {
        document.getElementById('tab-group').classList.add('alt-btns');
    }
}

function phoneFilterControls() {
    let infoPanel = document.getElementById('sidepanel');
    let infoPanelDrag = document.getElementById('info-panel-drag-indicator');
    let bodyHeight = document.querySelector('html').offsetHeight;
    let infoButton = document.getElementById('info-button');

    if(infoButton !== null) {
        infoButton.addEventListener('click', function() {
            infoPanel.classList.toggle('block');
            infoPanel.classList.toggle('hidden');
            infoButton.classList.toggle('active');
            if (infoPanel.classList.contains('block'))
            {
                if (window.innerWidth < 992) {
                    infoPanel.style.height = '50dvh';
                }
            }
        });
    }

    let touchStartY = 0;
    let touchEndY = 0;
    let currentHeight = parseInt(getComputedStyle(infoPanel).height);

    infoPanelDrag.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
        currentHeight = parseInt(getComputedStyle(infoPanel).height);
    });

    infoPanelDrag.addEventListener('touchmove', function(e) {
        touchEndY = e.touches[0].clientY;
        let touchDiffY = touchEndY - touchStartY;
        let newY = currentHeight - touchDiffY
        if (newY < (bodyHeight - 110)) {
            infoPanel.style.height = newY + 'px';
        }
    });

    infoPanelDrag.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].clientY;
        currentHeight = parseInt(getComputedStyle(infoPanel).height);

        if ((currentHeight < 150) && (currentHeight > 100)) {
            infoPanel.style.height = 100;
        }
        else if (currentHeight < 100) {
            infoPanel.classList.add('hidden');
            infoPanel.classList.remove('block');
            infoButton.classList.remove('active');
        } 
    });
}

function moveTabs() {
    const tabGroup = document.getElementById("tab-group");
    const legendPanel = document.getElementById("legend-panel");
    const moveablePanelContainter = document.getElementById("moveable-panels");
    const informationPanel = document.getElementById("information-panel");

    if (window.innerWidth < 992) {
        document.getElementById("tab-section").prepend(tabGroup);
        document.querySelectorAll("#information-panel [data-panel]").forEach(function(moveablePanel){
            moveablePanelContainter.append(moveablePanel);
        });
        document.getElementById("datalayer-btn").click();
    } else {
        legendPanel.prepend(tabGroup);
        document.querySelectorAll("#moveable-panels > div").forEach(function(moveablePanel){
            informationPanel.append(moveablePanel);
            moveablePanel.style.display = '';
        });
        if(document.querySelector("#tab-group button:nth-child(2)")) {
            document.querySelector("#tab-group button:nth-child(2)").click();
        }
        document.getElementById("sidepanel").classList.remove('hidden');
        if(document.getElementById("info-button")) {
            document.getElementById("info-button").classList.add('active');
        }
    }
}

function layerButtonsSwitch() {
    let mainMapBtns = document.querySelectorAll('#map_controls_3D > button');
    let extraMapBtns = document.querySelectorAll('#map_controls_3D > #map_controls_3D_panel > button');
    mainMapBtns.forEach(function(mainMapBtn) {
        mainMapBtn.addEventListener('click',function(e){
            mainMapBtns.forEach(function(notTarget) {
                notTarget.classList.remove("opacity-0");
            });
            e.currentTarget.classList.add('opacity-0');
            document.getElementById("map_controls_3D").classList.remove('hover-all');
        });
    });
    extraMapBtns.forEach(function(extraMapBtn) {
        extraMapBtn.addEventListener('click',function(e){
            document.getElementById("map_controls_3D").classList.add('hover-all');
        });
    });
}

function queryTbxReset(e) {
    document.getElementById('queryTbx').value = '';
    map.sources.getById('ds_search').clear();
    e.classList.add('hidden');
}